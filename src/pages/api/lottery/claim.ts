import type {NextApiResponse} from "next";
import { createRouter } from 'next-connect';

import logger from '@/lib/logger/winstonLogger';
import { mustAuthInterceptor, UserContextRequest } from '@/lib/middleware/auth';
import { errorInterceptor } from '@/lib/middleware/error';
import { ILotteryPool, LotteryRewardType } from '@/lib/models/LotteryPool';
import { getLotteryPoolById } from '@/lib/lottery/lottery';
import TwitterTopicTweet from '@/lib/models/TwitterTopicTweet';
import User, { increaseUserMoonBeam, IUser } from '@/lib/models/User';
import UserLotteryDrawHistory, {
    IUserLotteryRewardItem
} from '@/lib/models/UserLotteryDrawHistory';
import UserLotteryPool from '@/lib/models/UserLotteryPool';
import UserMoonBeamAudit, { UserMoonBeamAuditType } from '@/lib/models/UserMoonBeamAudit';
import UserTwitter from '@/lib/models/UserTwitter';
import doTransaction from '@/lib/mongodb/transaction';
import { redis } from '@/lib/redis/client';
import * as response from '@/lib/response/response';
import * as Sentry from '@sentry/nextjs';

const defaultErrorResponse = response.success(constructResponse(false, "Network busy, please try again later."));

const router = createRouter<UserContextRequest, NextApiResponse>();
router.use(errorInterceptor(), mustAuthInterceptor).post(async (req, res) => {
  const { draw_id, reward_id, lottery_pool_id } = req.body;
  if (!lottery_pool_id || !draw_id) {
    res.json(response.invalidParams(constructResponse(false, "Invalid params.")));
    return;
  }
  try {
    const lotteryPoolId = String(lottery_pool_id);
    const drawId = String(draw_id);
    const lotteryPool = await getLotteryPoolById(lotteryPoolId) as ILotteryPool;
    if (!lotteryPool) {
      res.json(response.invalidParams(constructResponse(false, "The lottery pool is not opened or has been closed.")));
    }
    const lockKey = `claim_claim_lock:${drawId}`;
    // 锁定用户抽奖资源10秒
    let interval: number = 10;
    const locked = await redis.set(lockKey, Date.now(), "EX", interval, "NX");
    if (!locked) {
      res.json(response.success(constructResponse(false, "You are already claiming this reward, please try again later.")))
    }
    const drawHistory = await UserLotteryDrawHistory.findOne({ user_id: req.userId, draw_id: drawId });
    if (!drawHistory) {
      res.json(response.notFound(constructResponse(false, "Cannot find a draw record for this claim.")));
    }
    if (drawHistory.need_verify_twitter) {
      const verifyResult = await verify(drawHistory.user_id, drawId, lotteryPoolId);
      if (!verifyResult.verified) {
        res.json(response.success(verifyResult));
      }
    }
    let rewards: IUserLotteryRewardItem[] = [];
    if (reward_id) {
      for (let item of drawHistory.rewards) {
        if (item.reward_id === reward_id) {
          rewards.push(item);
          break;
        }
      }
    }
    else {
      rewards = drawHistory.rewards;
    }
    for (let reward of rewards) {
      if (!reward.claimed) {
        await performClaimLotteryReward(reward!, lotteryPoolId, drawId, drawHistory.user_id, reward.reward_id);
      }
    }
    res.json(response.success(constructResponse(true, "Congratulations on claiming your lottery rewards.")));
  } catch (error) {
    logger.error(error);
    Sentry.captureException(error);
    res.status(500).json(defaultErrorResponse);
  }
});

async function performClaimLotteryReward(userReward: IUserLotteryRewardItem, lotteryPoolId: string, drawId: string, userId: string, rewardId: string): Promise<any> {
  const now = Date.now()
  switch (userReward.reward_type) {
    case LotteryRewardType.MoonBeam: {
      const moonBeamAudit = constructMoonBeamAudit(userId, lotteryPoolId, rewardId, userReward.amount);
      await doTransaction( async session => {
        await moonBeamAudit.save(session);
        await increaseUserMoonBeam(userId, userReward.amount, session);
        await updateLotteryDrawHistory(drawId, rewardId, now, session);
      }); 
    }
    case LotteryRewardType.LotteryTicket: {
      await doTransaction( async session => {
        await User.updateOne(
          { user_id: userId },
          { $inc: { lottery_ticket_amount: userReward.amount }},
          { session: session }
        );
        await updateLotteryDrawHistory(drawId, rewardId, now, session);
      });
    }
    default: {
      await updateLotteryDrawHistory(drawId, rewardId, now);
    }
  }
}

async function updateLotteryDrawHistory(drawId: string, rewardId: string, updateTime: number, session?: any) {
  await UserLotteryDrawHistory.findOneAndUpdate(
    { draw_id: drawId, "rewards.reward_id": rewardId }, 
    { "rewards.$[elem].claimed": true, update_time: updateTime }, 
    { arrayFilters: [{ "elem.reward_id": rewardId}], session: session });
}

function constructResponse(verified: boolean, message: string) {
  return { verified: verified, message: message };
}

function constructMoonBeamAudit(userId: string, lotteryPoolId: string, rewardId: string, moonBeamAmount: number) {
  let audit = new UserMoonBeamAudit({
    user_id: userId,
    type: UserMoonBeamAuditType.LuckyDraw,
    moon_beam_delta: moonBeamAmount,
    reward_taint: `lottery_pool_id:${lotteryPoolId},reward_id:${rewardId},user:${userId}`,
    corr_id: rewardId,
    extra_info: lotteryPoolId,
    created_time: Date.now(),
  });
  return audit;
}

async function verify(userId: string, drawId: string, lotteryPoolId: string): Promise<any> {
  const userTwitter = await UserTwitter.findOne({ user_id: userId, deleted_time: null });
  if (!userTwitter) {
    return constructResponse(false, "You should connect your Twitter Account first.");
  }
  const userLotteryPool = await UserLotteryPool.findOne({ user_id: userId, lottery_pool_id: lotteryPoolId, deleted_time: null });
  if (!userLotteryPool || !userLotteryPool.twitter_topic_id) {
    return constructResponse(false, "You should post twitter topic first.");
  }
  let tweet = await TwitterTopicTweet.findOne({ author_id: userTwitter.twitter_id, topic_id: userLotteryPool.twitter_topic_id }, { _id: 0, tweeted_at: 1 });
  // 一个奖池只需要发一次twitter话题, 不用重复检查
  if (tweet) {
    return constructResponse(true, "");
  }
  else {
    const lockKey = `claim_reward_lock:${userId}:${drawId}`;
    // TweetTopic为3分钟
    let interval: number = 3 * 60;
    const locked = await redis.set(lockKey, Date.now(), "EX", interval, "NX");
    if (!locked) {
        return constructResponse(false, `Verification is under a ${interval}s waiting period, please try again later.`);
    }
    tweet = await TwitterTopicTweet.findOne({ author_id: userTwitter.twitter_id, topic_id: userLotteryPool.twitter_topic_id }, { _id: 0, tweeted_at: 1 });
    if (tweet) {
        return constructResponse(true, "");
    }
  }
}

// this will run if none of the above matches
router.all((req, res) => {
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