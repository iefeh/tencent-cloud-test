import type { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import * as response from '@/lib/response/response';
import doTransaction from '@/lib/mongodb/transaction';
import { mustAuthInterceptor, UserContextRequest } from '@/lib/middleware/auth';
import CDK, { getCDKInfo, CDKRewardType } from '@/lib/models/CDK';
import UserMoonBeamAudit, { UserMoonBeamAuditType } from '@/lib/models/UserMoonBeamAudit';
import { try2AddUsers2MBLeaderboard } from '@/lib/redis/moonBeamLeaderboard';
import User from '@/lib/models/User';
import CDKRedeemRecord from '@/lib/models/CDKRedeemRecord';
import Badges, { RequirementType } from '@/lib/models/Badge';
import Whitelist from '@/lib/models/Whitelist';
import { WhitelistEntityType } from '@/lib/quests/types';
import { redis } from '@/lib/redis/client';
import UserNotifications from '@/lib/models/UserNotifications';
import { generateUUID } from 'three/src/math/MathUtils';
import UserBadges from '@/lib/models/UserBadges';
import UserBattlePassSeasons from '@/lib/models/UserBattlePassSeasons';
import { BattlePassRequirementType } from '@/lib/models/BattlepassPremiumRequirements';
import { generateBattlepass } from '../battlepass/participate';
import { getCurrentBattleSeason } from '@/lib/battlepass/battlepass';
import { resolveRuntimeExtensions } from '@aws-sdk/client-ses/dist-types/runtimeExtensions';
import GameTicket from '@/lib/models/GameTicket';
import { ethers } from 'ethers';
import MiniGameDetail from '@/lib/models/MiniGameDetail';


const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(mustAuthInterceptor).get(async (req, res) => {
  const { cdk } = req.query;

  if (!cdk) {
    res.json(response.invalidParams());
    return;
  }
  const userId = req.userId!;
  const redeemLock = `redeem_cdk_lock:${cdk}:${userId}`;
  const locked = await redis.set(redeemLock, Date.now(), 'EX', 30, 'NX');
  if (!locked) {
    res.json(
      response.success({
        result: 'Redeem is under a 30s waiting period, please try again later.'
      }),
    );
    return;
  }

  // 防止太多人同时兑换，添加的限流操作
  const redeemingCountKey = `redeeming-counter`;
  const timeoutKey = `redeeming-counter-timeout-key`;
  const ok = await redis.set(timeoutKey, Date.now(), "EX", 60, "NX");
  if (ok) {
    // 超时则重新开始计数
    await redis.set(redeemingCountKey, 0);
  }
  const current = await redis.incr(redeemingCountKey);
  if (current > 40) {
    await redis.decr(redeemingCountKey);
    res.json(
      response.success({
        result: 'Too many people are redeeming at the moment, please try again later.',
      }),
    );
    return;
  }

  try {
    let success: boolean = false;
    //查询CDK信息
    const cdkTemp = String(cdk);

    const cdkInfo = await getCDKInfo(cdkTemp, userId);


    //CDK不存在
    if (!cdkInfo) {
      res.json(
        response.notFound({
          success: success,
          msg: 'Invalid redeem code.',
        }),
      );
      return;
    }
    //CDK未启用
    if (!cdkInfo.template.active) {
      res.json(
        response.success({
          success: success,
          msg: 'The redeem code has expired.',
        }),
      );
      return;
    }
    //CDK未启用
    if (cdkInfo.expired_time < Date.now()) {
      res.json(
        response.success({
          success: success,
          msg: 'The redeem code has expired.',
        }),
      );
      return;
    }
    //是否已领取
    if (cdkInfo.redeem_record.length > 0) {
      res.json(
        response.success({
          success: success,
          msg: 'The redeem code has expired.',
        }),
      );
      return;
    }
    //是否仍可领取
    if (cdkInfo.template.max_redeem_count === 0 || cdkInfo.max_redeem_count > cdkInfo.current_redeem_count) {
      //构建CDK升级数据

      const result = await redeemCDK(cdkInfo, userId);
      if (result) {
        res.json(
          response.success({
            success: success,
            msg: result
          })
        );
      } else {
        success = true;
        res.json(
          response.success({
            success: success,
            msg: 'Redeem success.',
            reward: cdkInfo.template.rewards,
          }),
        );
        return;
      }
    } else {
      res.json(
        response.invalidParams({
          msg: 'The redeem code has expired.',
        }),
      );
    }
  } finally {
    await redis.del(redeemLock);
    await redis.decr(redeemingCountKey);
  }
});

async function redeemCDK(cdkInfo: any, userId: string): Promise<any> {
  //构建领取记录
  let redeemRecord: any = new CDKRedeemRecord({
    cdk: cdkInfo.cdk, //CDK
    redeem_user_id: userId, //兑换人
    redeem_taint: [`user_id:${userId},cdk:${cdkInfo.cdk}`], //兑换污点
    redeem_time: Date.now(),
  });
  //若相同渠道的CDK不允许重复领取，则修改taint.
  if (!cdkInfo.channel.repeat_claimable) {
    redeemRecord.redeem_taint = [`user_id:${userId},channel_id:${cdkInfo.channel.id}`];
    const history = await CDKRedeemRecord.findOne({ redeem_taint: redeemRecord.redeem_taint[0] });
    if (history) {
      return "Redeem code type conflict, cannot claim the same reward again.";
    }
  }

  const result = await doTransaction(async (session) => {
    //保存领取记录
    for (let reward of cdkInfo.template.rewards) {
      switch (reward.type) {
        case CDKRewardType.MoonBeam:
          await redeemMoonBeamReward(userId, cdkInfo.cdk, session, reward);
          break;
        case CDKRewardType.Badge:
          await redeemBadgeReward(userId, cdkInfo.cdk, session, reward);
          break;
        case CDKRewardType.LotteryTicket:
          await redeemLotteryTicketReward(userId, session, reward);
          break;
        case CDKRewardType.PremiumPass:
          await redeemPremiumPassReward(userId, session, reward);
          break;
        case CDKRewardType.GameTicket:
          await redeemGameTicketReward(userId, cdkInfo.cdk, session, reward);
          break;
      }
    }

    await CDKRedeemRecord.insertMany([redeemRecord], { session: session });

    //CDK领取人数量加1
    await CDK.updateOne({ cdk: cdkInfo.cdk }, { $inc: { current_redeem_count: 1 } }, { session: session });
  });
}

async function redeemMoonBeamReward(userId: string, cdk: string, session: any, reward: any) {
  const taint: string = `user_id:${userId},cdk:${cdk}`;
  await UserMoonBeamAudit.insertMany(
    [
      {
        user_id: userId,
        type: UserMoonBeamAuditType.CDK,
        moon_beam_delta: reward.amount,
        reward_taint: taint,
        corr_id: cdk,
        created_time: Date.now(),
      },
    ],
    { session: session },
  );

  //更新用户moonbeam数据
  await User.updateOne({ user_id: userId }, { $inc: { moon_beam: reward.amount } }, { session: session });
  await try2AddUsers2MBLeaderboard(userId);
}

async function redeemBadgeReward(userId: string, cdk: string, session: any, reward: any) {
  const userBadge = await UserBadges.findOne({ user_id: userId, badge_id: reward.badge_id });
  if (userBadge) {
    return;
  }

  const badge = await Badges.findOne({ id: reward.badge_id });
  //徽章不存在
  if (!badge) {
    throw new Error('Badge not exists.');
  }
  let series: number = 0;
  for (let s of badge.series.keys()) {
    series = s;
    break;
  }
  if (series == 0) {
    throw new Error('Badge series not exists.');
  }
  const now = Date.now();
  await UserBadges.insertMany(
    [
      {
        user_id: userId,
        badge_id: reward.badge_id,
        badge_taints: [`user_id: ${userId},badge_id:${reward.badge_id},cdk:${cdk}`],
        series: { [series]: { obtained_time: now } },
        display: false,
        created_time: now,
        updated_time: now,
        order: 1,
        display_order: 1,
      },
    ],
    { session: session },
  );

  if (reward.alert) {
    await new UserNotifications({
      user_id: userId,
      notification_id: generateUUID(),
      content: reward.alert.content,
      link: reward.alert.link,
      //创建时间
      created_time: Date.now(),
    }).save();
  }
}

async function redeemLotteryTicketReward(userId: string, session: any, reward: any) {
  await User.updateOne({ user_id: userId },
    {
      $inc: { lottery_ticket_amount: reward.amount },
      $setOnInsert: {
        created_time: Date.now(),
      },
    },
    { upsert: true, session: session });
  if (reward.alert) {
    await new UserNotifications({
      user_id: userId,
      notification_id: generateUUID(),
      content: reward.alert.content,
      link: reward.alert.link,
      //创建时间
      created_time: Date.now(),
    }).save();
  }
}

async function redeemPremiumPassReward(userId: string, session: any, reward: any) {
  // 查看用户是否已参加高阶通证
  const battlepass = await UserBattlePassSeasons.findOne({ user_id: userId, battlepass_season_id: reward.season_id });
  if (!battlepass) {
    const season = await getCurrentBattleSeason();
    const result = await generateBattlepass(userId, season);
    if (result.is_premium) {
      return;
    }
  }
  // 查看是否已是高阶通证
  if (battlepass && battlepass.is_premium) {
    return;
  }

  await UserBattlePassSeasons.updateOne({ user_id: userId, battlepass_season_id: reward.season_id }, { premium_type: BattlePassRequirementType.WhiteList, premium_source: 'Special Event Whitelist', is_premium: true, updated_time: Date.now() }, { session: session });
}

async function redeemGameTicketReward(userId: string, cdk: string, session: any, reward: any) {
  // 获取过期时间
  const client = await MiniGameDetail.findOne({ client_id: reward.game_id });

  let expiration: number;
  if (client.ticket_expired_at) {
    expiration = client.ticket_expired_at;
  } else {
    expiration = 10 * Date.now();
  }
  let tickets: any[] = [];
  for (let i = 0; i < reward.amount; i++) {
    const ticket = new GameTicket();
    ticket.pass_id = `CDK-${ethers.id(`${userId}-${cdk}-${reward.game_id}-${i}`)}`;
    ticket.user_id = userId;
    ticket.game_id = reward.game_id;
    ticket.created_at = Date.now();
    ticket.expired_at = expiration;
    tickets.push(ticket);
  }
  
  await GameTicket.insertMany(tickets, { session: session });
}

// this will run if none of the above matches
router.all((req, res) => {
  if (req.method === 'OPTIONS') {
    return res.status(204).end(); // 预检请求返回 204，避免 GET 触发错误
  }
  res.status(405).json({
    error: 'Method not allowed',
  });
});

export default router.handler({
  onError(err, req, res) {
    console.error(err);
    res.status(500).json(response.serverError());
  },
});
