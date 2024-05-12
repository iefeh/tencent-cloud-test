import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import * as response from "@/lib/response/response";
import * as Sentry from "@sentry/nextjs";
import doTransaction from "@/lib/mongodb/transaction";
import {errorInterceptor} from '@/lib/middleware/error';
import logger from "@/lib/logger/winstonLogger";
import LotteryPool, { LotteryRewardType } from "@/lib/models/LotteryPool";
import {mustAuthInterceptor, UserContextRequest} from "@/lib/middleware/auth";
import { redis } from "@/lib/redis/client";
import TwitterTopicTweet from "@/lib/models/TwitterTopicTweet";
import { increaseUserMoonBeam } from "@/lib/models/User";
import UserLotteryPool from "@/lib/models/UserLotteryPool";
import UserLotteryDrawHistory, { IUserLotteryRewardItem } from "@/lib/models/UserLotteryDrawHistory";
import UserTwitter from '@/lib/models/UserTwitter';

const defaultErrorResponse = response.success({
  verified: false,
  tip: "Network busy, please try again later.",
})

const router = createRouter<UserContextRequest, NextApiResponse>();
router.use(errorInterceptor(), mustAuthInterceptor).post(async (req, res) => {
  const { draw_id, reward_id, lottery_pool_id } = req.body;
  if (!reward_id || !lottery_pool_id || !draw_id) {
    res.json(response.invalidParams());
    return;
  }
  try {
    const lotteryPool = await LotteryPool.findOne({ lottery_pool_id: lottery_pool_id });
    if (!lotteryPool || lotteryPool.end_time < Date.now()) {
      res.json(response.invalidParams({ message: "Invalid lottery pool id or lottery pool is closed." }));
    }
    const lockKey = `claim_claim_lock:${draw_id}:${reward_id}`;
    // 锁定用户抽奖资源10秒
    let interval: number = 10;
    const locked = await redis.set(lockKey, Date.now(), "EX", interval, "NX");
    if (!locked) {
      res.json(response.success("You are already claiming this reward, please try again later."))
    }
    const drawHistory = await UserLotteryDrawHistory.findOne({ draw_id: draw_id, "rewards.reward_id": reward_id });
    if (!drawHistory) {
      res.json(response.notFound({ message: "Cannot find a draw record for this claim."}));
    }
    let reward: IUserLotteryRewardItem;
    for (let item of drawHistory.rewards) {
      if (item.reward_id === reward_id) {
        reward = item;
        break;
      }
    }
    if (reward!.claimed) {
      res.json(response.invalidParams({ message: "This reward is already claimed." }));
    }
    else {
      if (reward!.reward_claim_type === 1) {
        //发放奖品时使用抽奖记录里面的user_id避免冒领奖品
        const claimResult = await performClaimLotteryReward(reward!, lottery_pool_id, draw_id, drawHistory.user_id, reward_id);
        res.json(response.success(claimResult));
      }
      else {
        const verifyResult = await verify(drawHistory.user_id, reward_id, lottery_pool_id);
        if (verifyResult.verified) {
          const claimResult = await performClaimLotteryReward(reward!, lottery_pool_id, draw_id, drawHistory.user_id, reward_id);
          res.json(response.success(claimResult));
        }
        else {
          res.json(response.success(verifyResult));
        }
      }
      res.json(response.success());
    }
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
      await doTransaction( async session => {
        await increaseUserMoonBeam(userId, userReward.amount, session);
        await updateLotteryDrawHistory(drawId, rewardId, now, session);
      }); 
      return { message: `You have claimed reward and received ${userReward.amount} mb.` };
    }
    case LotteryRewardType.LotteryTicket: {
      await doTransaction( async session => {
        await UserLotteryPool.updateOne(
          { user_id: userId, lottery_pool_id: lotteryPoolId}, 
          { $inc: { free_lottery_ticket_amount: userReward.amount }},
          { upsert: true, session: session }
        );
        await updateLotteryDrawHistory(drawId, rewardId, now, session);
      });
      return { message: `You have claimed reward and received ${userReward.amount} free lottery tickets.` };
    }
    case LotteryRewardType.NoPrize: {
      await updateLotteryDrawHistory(drawId, rewardId, now);
      return { message: `Lucky next time.` };
    }
    default: {
      await updateLotteryDrawHistory(drawId, rewardId, now);
      return { message: `Please keep in touch, we will send you the rewards later.`};
    }
  }
}

async function updateLotteryDrawHistory(drawId: string, rewardId: string, updateTime: number, session?: any) {
  await UserLotteryDrawHistory.findOneAndUpdate(
    { draw_id: drawId, "rewards.reward_id": rewardId }, 
    { "rewards.$[elem].claimed": true, update_time: updateTime }, 
    { arrayFilters: [{ "elem.reward_id": rewardId}], session: session });
}

async function verify(userId: string, rewardId: string, lotteryPoolId: string): Promise<any> {
  const userTwitter = await UserTwitter.findOne({ user_id: userId, deleted_time: null });
  if (!userTwitter) {
    return {
        verified: false,
        tip: "You should connect your Twitter Account first."
    };
  }
  const userLotteryPool = await UserLotteryPool.findOne({ user_id: userId, lottery_pool_id: lotteryPoolId });
  if (!userLotteryPool || !userLotteryPool.twitter_topic_id) {
    return {
      verified: false,
      tip: "You should share twitter topic first."
    };
  }
  let tweet = await TwitterTopicTweet.findOne({ author_id: userTwitter.twitter_id, topic_id: userLotteryPool.twitter_topic_id }, { _id: 0, tweeted_at: 1 });
  // 一个奖池只需要发一次twitter话题, 不用重复检查
  if (tweet) {
    return {
      verified: true
    };
  }
  else {
    const lockKey = `claim_reward_lock:${rewardId}:${userId}`;
    // TweetTopic为3分钟
    let interval: number = 3 * 60;
    const locked = await redis.set(lockKey, Date.now(), "EX", interval, "NX");
    if (!locked) {
        return {
            verified: false,
            tip: `Verification is under a ${interval}s waiting period, please try again later.`,
        };
    }
    tweet = await TwitterTopicTweet.findOne({ author_id: userTwitter.twitter_id, topic_id: userLotteryPool.twitter_topic_id }, { _id: 0, tweeted_at: 1 });
    if (tweet) {
        return {
          verified: true
        };
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