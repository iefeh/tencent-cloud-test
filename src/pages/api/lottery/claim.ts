import type {NextApiResponse} from "next";
import { createRouter } from 'next-connect';

import logger from '@/lib/logger/winstonLogger';
import {
    constructMoonBeamAudit, constructVerifyResponse, getLotteryPoolById, verifyTwitterTopic
} from '@/lib/lottery/lottery';
import { mustAuthInterceptor, UserContextRequest } from '@/lib/middleware/auth';
import { errorInterceptor } from '@/lib/middleware/error';
import { ILotteryPool, LotteryRewardType } from '@/lib/models/LotteryPool';
import User, { increaseUserMoonBeam } from '@/lib/models/User';
import UserLotteryDrawHistory, {
    IUserLotteryDrawHistory, IUserLotteryRewardItem
} from '@/lib/models/UserLotteryDrawHistory';
import doTransaction from '@/lib/mongodb/transaction';
import { redis } from '@/lib/redis/client';
import * as response from '@/lib/response/response';
import * as Sentry from '@sentry/nextjs';

const defaultErrorResponse = response.success(constructVerifyResponse(false, "Network busy, please try again later."));

const router = createRouter<UserContextRequest, NextApiResponse>();
router.use(errorInterceptor(), mustAuthInterceptor).post(async (req, res) => {
  const { draw_id, reward_id, lottery_pool_id } = req.body;
  if (!lottery_pool_id || !draw_id) {
    res.json(response.invalidParams(constructVerifyResponse(false, "Invalid params.")));
    return;
  }
  try {
    const lotteryPoolId = String(lottery_pool_id);
    const drawId = String(draw_id);
    const lotteryPool = await getLotteryPoolById(lotteryPoolId) as ILotteryPool;
    if (!lotteryPool) {
      res.json(response.invalidParams(constructVerifyResponse(false, "The lottery pool is not opened or has been closed.")));
      return;
    }
    const lockKey = `claim_claim_lock:${drawId}`;
    // 锁定用户抽奖资源10秒
    let interval: number = 10;
    const locked = await redis.set(lockKey, Date.now(), "EX", interval, "NX");
    if (!locked) {
      res.json(response.serverError(constructVerifyResponse(false, "You are already claiming this reward, please try again later.")))
      return;
    }
    const drawHistory = await UserLotteryDrawHistory.findOne({ user_id: req.userId, draw_id: drawId }) as IUserLotteryDrawHistory;
    if (!drawHistory) {
      res.json(response.invalidParams(constructVerifyResponse(false, "Cannot find a draw record for this claim.")));
      return;
    }
    if (drawHistory.need_verify_twitter) {
      const maxClaimType = Math.max(...drawHistory.rewards.map(reward => (reward.reward_claim_type)));
      const verifyResult = await verifyTwitterTopic(drawHistory.user_id, lotteryPoolId, maxClaimType);
      if (!verifyResult.verified) {
        res.json(response.success(verifyResult));
        return;
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
    res.json(response.success(constructVerifyResponse(true, "Congratulations on claiming your lottery rewards.")));
    return;
  } catch (error) {
    logger.error(error);
    Sentry.captureException(error);
    res.status(500).json(defaultErrorResponse);
    return;
  }
});

async function performClaimLotteryReward(userReward: IUserLotteryRewardItem, lotteryPoolId: string, drawId: string, userId: string, rewardId: string): Promise<any> {
  const now = Date.now()
  switch (userReward.reward_type) {
    case LotteryRewardType.MoonBeam: 
      const moonBeamAudit = constructMoonBeamAudit(userId, lotteryPoolId, rewardId, userReward.amount);
      await doTransaction( async session => {
        await moonBeamAudit.save(session);
        await increaseUserMoonBeam(userId, userReward.amount, session);
        await updateLotteryDrawHistory(drawId, rewardId, now, session);
      }); 
      break;
    case LotteryRewardType.LotteryTicket: 
      await doTransaction( async session => {
        await User.updateOne(
          { user_id: userId },
          { $inc: { lottery_ticket_amount: userReward.amount }},
          { session: session }
        );
        await updateLotteryDrawHistory(drawId, rewardId, now, session);
      });
      break;
    default:
      await updateLotteryDrawHistory(drawId, rewardId, now);
      break;
  }
}

async function updateLotteryDrawHistory(drawId: string, rewardId: string, updateTime: number, session?: any) {
  await UserLotteryDrawHistory.findOneAndUpdate(
    { draw_id: drawId, "rewards.reward_id": rewardId }, 
    { "rewards.$[elem].claimed": true, update_time: updateTime }, 
    { arrayFilters: [{ "elem.reward_id": rewardId}], session: session });
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