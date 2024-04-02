import type { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import * as response from '@/lib/response/response';
import { mustAuthInterceptor, UserContextRequest } from '@/lib/middleware/auth';
import UserBadges, { IUserBadges } from '@/lib/models/UserBadges';
import Badge, { BadgeSeries, IBadges } from '@/lib/models/Badge';
import { errorInterceptor } from '@/lib/middleware/error';
import { ResponseData } from '@/lib/response/response';
import { redis } from '@/lib/redis/client';
import UserMoonBeamAudit, { UserMoonBeamAuditType } from '@/lib/models/UserMoonBeamAudit';
import doTransaction from '@/lib/mongodb/transaction';
import { th } from 'date-fns/locale';
import logger from '@/lib/logger/winstonLogger';
import { try2AddUser2MBLeaderboard } from '@/lib/redis/moonBeamLeaderboard';
import User from '@/lib/models/User';
import UserInvite from '@/lib/models/UserInvite';
import { incrUserMetric, Metric } from '@/lib/models/UserMetrics';

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(errorInterceptor(), mustAuthInterceptor).post(async (req, res) => {
  const { badge_id, badge_lv } = req.body;
  if (!badge_id || !badge_lv) {
    res.json(response.invalidParams());
    return;
  }

  const badgeId = String(badge_id);
  const lv = String(badge_lv);
  let userId = req.userId!;
  const data = await try2ClaimBadge(userId, badgeId, lv)
  res.json(data);
});

async function try2ClaimBadge(userId: string, badgeId: string, level: string): Promise<any> {
  const claimLock = `claim_badge_lock:${badgeId}:${userId}`;
  const locked = await redis.set(claimLock, Date.now(), "EX", 60, "NX");
  if (!locked) {
    return response.success({
      result: "Claim is under a waiting period, please try again later.",
    })
  }
  try {
    // 检查徽章
    const badge = await Badge.findOne({ id: badgeId });
    if (!badge) {
      return response.success({
        result: "Unknown badge.",
      })
    }
    if (!badge.active) {
      return response.success({
        result: "Badge cannot be clamed temporarily.",
      })
    }
    // 检查用户达成的徽章
    const userBadge = await UserBadges.findOne({ user_id: userId, badge_id: badgeId });
    if (!userBadge) {
      return response.success({
        result: 'Badge not obtained.',
      });
    }
    const series = userBadge.series.get(level)
    if (!series) {
      return response.success({
        result: 'You are not eligible to claim this badge level.',
      });
    }
    // 检查用户是否已经领取过该徽章
    if (series.claimed_time) {
      return response.success({
        result: 'Badge already claimed.',
      });
    }
    const reward = await constructBadgeMoonbeamReward(userBadge, level);
    const inviterId = await checkNoviceNotchInviter(userId, badge);
    console.log('inviterId:', inviterId);
    // 构建领取徽章对象
    const claimBadge: any = {};
    const now = Date.now();
    for (let s of reward.series) {
      claimBadge[`series.${s}.claimed_time`] = now;
    }
    // 领取徽章、发放用户奖励、邀请者拉新指标更新
    await doTransaction(async (session) => {
      const opts = { session };
      if (reward.mb > 0) {
        await UserMoonBeamAudit.bulkSave(reward.audits, opts);
        await User.updateOne({ user_id: userId }, { $inc: { moon_beam: reward.mb } }, opts);
      }
      await UserBadges.updateOne({ user_id: userId, badge_id: badgeId }, {
        $set: claimBadge,
      }, opts);
      if (inviterId) {
        await incrUserMetric(inviterId, Metric.TotalNoviceBadgeInvitee, 1, session);
      }
    });
    // 当有MB下发时，刷新用户的MB缓存
    if (reward.mb > 0) {
      await try2AddUser2MBLeaderboard(userId);
      return response.success({
        result: `You have claimed badge and received ${reward.mb} MB.`,
      });
    }
    return response.success({
      result: 'You have claimed badge.',
    });
  } finally {
    await redis.del(claimLock);
  }
}

async function checkNoviceNotchInviter(userId: string, badge: IBadges): Promise<string | null> {
  if (!badge) {
    return null;
  }
  if (badge.id !== process.env.NOICE_BADGE_ID) {
    console.log('badge.id:', badge.id);
    return null;
  }
  // 当前是新手徽章，检查用户的邀请人
  const inviter = await UserInvite.findOne({ invitee_id: userId });
  if (!inviter) {
    return null;
  }
  return inviter.user_id;
}

// 构建徽章下发的奖励，如MB
async function constructBadgeMoonbeamReward(userBadge: IUserBadges, level: string): Promise<{ mb: number, series: string[], audits: any[] }> {
  const badge = await Badge.findOne({ id: userBadge.badge_id });
  if (!badge) {
    throw new Error(`Badge ${userBadge.badge_id} should but not found.`);
  }
  let badgeSeries: any[] = [];
  // 把徽章系列转为列表，并且加上level属性
  badge.series.forEach((bs: BadgeSeries, lvl: string) => {
    badgeSeries.push({
      ...bs,
      level: lvl,
    });
  });
  // 按level进行升序排列
  badgeSeries = badgeSeries.sort((a, b) => a.level - b.level);

  // 遍历系列，领取直到level的所有未领取的奖励
  let rewards: any[] = [];
  let mb = 0;
  let claimSeries: string[] = [];
  const now = Date.now();
  for (let s of badgeSeries) {
    if (Number(s.level) > Number(level)) {
      break;
    }
    // 检查是否已经领取
    const claimedLvl = userBadge.series.get(s.level);
    if (claimedLvl && claimedLvl.claimed_time) {
      // 已经领取奖励，直接跳过
      logger.debug(`user ${userBadge.user_id} badge ${badge.id} series ${s.level} claimed, skip.`);
      continue;
    }
    // 检查当前徽章的奖励
    if (s.reward_moon_beam == undefined) {
      throw new Error(`Badge ${badge.id} series ${s.level} reward_moon_beam should but not found.`);
    }
    // 记录领取的系列等级，用户标识已经领取对应系列的奖励
    claimSeries.push(s.level);
    if (s.reward_moon_beam == 0) {
      logger.debug(`Badge ${badge.id} series ${s.level} reward_moon_beam is 0, skip.`);
      continue;
    }
    logger.debug(`user ${userBadge.user_id} claiming badge ${badge.id} series ${s.level} mb ${s.reward_moon_beam}.`);
    mb += s.reward_moon_beam;
    rewards.push(new UserMoonBeamAudit({
      user_id: userBadge.user_id,
      type: UserMoonBeamAuditType.Badges,
      moon_beam_delta: s.reward_moon_beam,
      reward_taint: `badge:${userBadge.badge_id},level:${s.level},user:${userBadge.user_id}`,
      corr_id: userBadge.badge_id,
      extra_info: s.level,
      created_time: now,
    }));
  }
  return {
    mb,
    series: claimSeries,
    audits: rewards,
  };
}

// this will run if none of the above matches
router.all((req, res) => {
  res.status(405).json({
    error: "Method not allowed",
  });
});

export default router.handler();
