import type { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import * as response from '@/lib/response/response';
import { mustAuthInterceptor, UserContextRequest } from '@/lib/middleware/auth';
import { errorInterceptor } from '@/lib/middleware/error';
import { redis } from '@/lib/redis/client';
import UserMoonBeamAudit, { UserMoonBeamAuditType } from '@/lib/models/UserMoonBeamAudit';
import doTransaction from '@/lib/mongodb/transaction';
import { try2AddUsers2MBLeaderboard } from '@/lib/redis/moonBeamLeaderboard';
import User from '@/lib/models/User';
import UserBattlePassSeasons from '@/lib/models/UserBattlePassSeasons';
import { BattlepassRewardType, BattlePassRewardItemType } from '@/lib/models/BattlePassSeasons';
import { getCurrentBattleSeason, isPremiumSatisfied } from '@/lib/battlepass/battlepass';
import UserMetrics from '@/lib/models/UserMetrics';
import { sendBadgeCheckMessages } from '@/lib/kafka/client';

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(errorInterceptor(), mustAuthInterceptor).post(async (req, res) => {
  const { reward_type, lv } = req.body;
  if (!reward_type || !lv) {
    res.json(response.invalidParams());
    return;
  }
  const userId = req.userId!;
  const rewardType = String(reward_type);
  const level = String(lv);

  const data = await try2ClaimReward(userId, rewardType, level);

  res.json(data);
});

async function try2ClaimReward(userId: string, rewardType: string, level: string): Promise<any> {
  const claimLock = `claim_battlepass_reward_lock:${level}:${rewardType}:${userId}`;
  const locked = await redis.set(claimLock, Date.now(), "EX", 60, "NX");
  if (!locked) {
    return response.success({
      result: "Claim is under a waiting period, please try again later.",
    })
  }
  try {
    //若为高阶通证领取奖励，需要判断当前是否仍有资格
    if (rewardType === BattlepassRewardType.Premium) {
      const isPremium: boolean = await isPremiumSatisfied(userId);
      if (!isPremium) {
        return response.success({ result: "You do not meet the condition for PREMIUM." });
      }
    }

    //检查用户是否有赛季通行证
    const currentBattleSeason = await getCurrentBattleSeason();
    if (!currentBattleSeason) {
      return response.success({ result: "Out of battle pass season." });
    }

    const userBattlepass = await UserBattlePassSeasons.findOne({ user_id: userId, battlepass_season_id: currentBattleSeason.id })
    if (!userBattlepass) {
      return response.success({ result: "You don't have a battle pass." });
    }
    //检查用户满足该等级领取条件
    let satisfied: boolean = false;
    let targetRecord: any;
    if (rewardType === BattlepassRewardType.Premium) {
      for (let p of Object.keys(userBattlepass.reward_records.get('premium'))) {
        if (p === level) {
          targetRecord = userBattlepass.reward_records.get('premium')[p];
          if (targetRecord.claimed_time) {
            return response.success({ result: 'You already claimed reward.' })
          }
          satisfied = true;
          break;
        }
      }
    } else {
      for (let p of Object.keys(userBattlepass.reward_records.get('standard'))) {
        if (p === level) {
          targetRecord = userBattlepass.reward_records.get('standard')[p];
          if (targetRecord.claimed_time) {
            return response.success({ result: 'You already claimed reward.' });
          }
          satisfied = true;
          break;
        }
      }
    }
    if (!satisfied) {
      return response.success({ result: "You are not meet the condition for reward." });
    }

    // 构建奖励领取对象
    const reward = await constructBattlepassMoonbeamReward(userId, currentBattleSeason, rewardType, level)
    if (reward.mb === 0) {
      return response.success({ result: "Do not reward moon beam." });
    }
    //创建用赛季通证奖励领取对象
    const claimReward: any = {};
    const now = Date.now();
    //claimReward[`reward_records.${rewardType}.${level}.satisfied_time`] = targetRecord.satisfied_time;
    claimReward[`reward_records.${rewardType}.${level}.claimed_time`] = now;
    claimReward['updated_time'] = now;

    const metricUpdate: any = {};
    if (rewardType === BattlepassRewardType.Premium) {
      metricUpdate[`battlepass_season_${currentBattleSeason.id}_premium_pass`] = userBattlepass.finished_tasks;
    }else{
      metricUpdate[`battlepass_season_${currentBattleSeason.id}_standard_pass`] = userBattlepass.finished_tasks;
    }
    // 领取徽章、发放用户奖励
    await doTransaction(async (session) => {
      const opts = { session };
      if (reward.mb > 0) {
        await reward.audit.save(opts);
        await User.updateOne({ user_id: userId }, { $inc: { moon_beam: reward.mb } }, opts);
      }
      await UserBattlePassSeasons.updateOne({ user_id: userId, battlepass_season_id: currentBattleSeason.id }, {
        $set: claimReward,
        $inc: { total_moon_beam: reward.mb }
      }, opts);
      await UserMetrics.updateOne({ user_id: userId }, metricUpdate, opts);
    });
    //发送消息给消息队列，检查一下，是否满足徽章下发条件
    await sendBadgeCheckMessages(userId, metricUpdate);
    // 当有MB下发时，刷新用户的MB缓存
    if (reward.mb > 0) {
      await try2AddUsers2MBLeaderboard(userId);
      return response.success({
        result: `You have claimed reward and received ${reward.mb} MB.`,
      });
    }
    return response.success({
      result: 'You have claimed reward.',
    });
  } finally {
    await redis.del(claimLock);
  }
}

// 构建徽章下发的奖励，如MB
async function constructBattlepassMoonbeamReward(userId: string, currentBattleSeason: any, rewardType: string, level: string): Promise<{ mb: number, audit: any }> {
  //判断是否为高阶通证下发奖励
  let targetReward: any;
  if (rewardType === BattlepassRewardType.Premium) {
    for (let c of currentBattleSeason.premium_pass.keys()) {
      if (c === level) {
        targetReward = currentBattleSeason.premium_pass.get(c);
        break;
      }
    }
  } else {
    for (let c of currentBattleSeason.standard_pass.keys()) {
      if (c === level) {
        targetReward = currentBattleSeason.standard_pass.get(c);
        break;
      }
    }
  }
  if (!targetReward) {
    return { mb: 0, audit: undefined }
  }
  //获得奖励mb的奖励
  let moonBeamReward: any;
  for (let r of targetReward.rewards) {
    if (r.type === BattlePassRewardItemType.MoonBeam) {
      moonBeamReward = r;
      break;
    }
  }
  if (!moonBeamReward) {
    return { mb: 0, audit: undefined }
  }

  let audit = new UserMoonBeamAudit({
    user_id: userId,
    type: UserMoonBeamAuditType.BattlePass,
    moon_beam_delta: moonBeamReward.properties.amount,
    reward_taint: `season_id:${currentBattleSeason.id},type:${rewardType},level:${level},user:${userId}`,
    corr_id: currentBattleSeason.id,
    extra_info: level,
    created_time: Date.now(),
  })
  return { mb: audit.moon_beam_delta, audit: audit }
}

// this will run if none of the above matches
router.all((req, res) => {
  res.status(405).json({
    error: "Method not allowed",
  });
});

export default router.handler();
