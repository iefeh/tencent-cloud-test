import type {NextApiResponse} from "next";
import { createRouter } from 'next-connect';
import { v4 as uuidv4 } from 'uuid';

import { AuthorizationType } from '@/lib/authorization/types';
import { promiseSleep } from '@/lib/common/sleep';
import logger from '@/lib/logger/winstonLogger';
import { getActiveLotteryPoolById, verifyLotteryQualification } from '@/lib/lottery/lottery';
import { LotteryRewardType } from '@/lib/lottery/types';
import { mustAuthInterceptor, UserContextRequest } from '@/lib/middleware/auth';
import { errorInterceptor } from '@/lib/middleware/error';
import LotteryPool, { ILotteryPool, ILotteryRewardItem } from '@/lib/models/LotteryPool';
import User from '@/lib/models/User';
import UserBadges from '@/lib/models/UserBadges';
import UserLotteryDrawHistory, {
    IUserLotteryRewardItem
} from '@/lib/models/UserLotteryDrawHistory';
import UserLotteryPool, { IUserLotteryPool } from '@/lib/models/UserLotteryPool';
import { incrUserMetric, Metric } from '@/lib/models/UserMetrics';
import { isDuplicateKeyError } from '@/lib/mongodb/client';
import doTransaction from '@/lib/mongodb/transaction';
import { redis } from '@/lib/redis/client';
import * as response from '@/lib/response/response';
import * as Sentry from '@sentry/nextjs';

const defaultErrorResponse = response.success({
  verified: false,
  message: "Network busy, please try again later.",
});

const drawOnce = {
  item_id: "drawOnceMore",
  reward_type: LotteryRewardType.LotteryTicket,
  reward_name: "Golden S1 Ticket x1",
  reward_claim_type: 1,
  reward_level: 2,
  icon_url: "https://moonveil-public.s3.ap-southeast-2.amazonaws.com/lottery/ticket_s1.png",
  badge_id: "",
  first_three_draw_probability: 0,
  next_six_draw_probability: 0,
  inventory_amount: null,
  min_reward_draw_amount: 0,
  guaranteed_draw_count: [],
  amount: 1
};

interface DrawResult {
  verified: boolean,
  duplicated: boolean,
  message?: string,
  lottery_pool_id?: string,
  available_draw_time?: string | number,
  draw_id?: string,
  rewards?: IUserLotteryRewardItem[],
  require_authorization?: string | undefined
}

const router = createRouter<UserContextRequest, NextApiResponse>();
router.use(errorInterceptor(), mustAuthInterceptor).post(async (req, res) => {
  const { lottery_pool_id, draw_count, lottery_ticket_cost, mb_cost } = req.body;
  const validDrawCount = [1, 3, 5]; 
  if (!lottery_pool_id || !draw_count || !validDrawCount.includes(draw_count) || lottery_ticket_cost < 0 || mb_cost < 0) {
    return res.json(response.invalidParams({verified: false, message: "Invalid params."}));
  }
  const userId = String(req.userId);
  const lotteryPoolId = String(lottery_pool_id);
  const lotteryPool = await getActiveLotteryPoolById(lotteryPoolId) as ILotteryPool;
  if (!lotteryPool) {
    return res.json(response.invalidParams({verified: false, message: "The lottery pool is not opened or has been closed."}));
  }
  try {
    const canDraw = await verifyLotteryQualification(lotteryPoolId, draw_count, lottery_ticket_cost, mb_cost, userId);
    if (!canDraw.verified) {
      return res.json(response.invalidParams(canDraw));
    }
    else {
      let drawResult = await draw(userId, lotteryPoolId, draw_count, lottery_ticket_cost, mb_cost);
      if (drawResult.verified) {
        return res.json(response.success(drawResult));
      }
      else {
        return res.json(response.serverError(drawResult));
      }
    }
  } catch (error) {
    logger.error(error);
    Sentry.captureException(error);
    return res.status(500).json(defaultErrorResponse);
  }
});

export async function draw(userId: string, lotteryPoolId: string, drawCount: number, lotteryTicketCost: number, mbCost: number, chainRequestId?: string): Promise<DrawResult> {
  const lockKey = `claim_draw_lock:${lotteryPoolId}`;
  // 锁定奖池1秒
  let interval: number = 2;
  let retry: number = 0;
  let locked = await redis.set(lockKey, Date.now(), "EX", interval, "NX");
  // 如果奖池已被他人锁定, 重试10次
  while (!locked && retry < 10) {
    await promiseSleep(1000);
    locked = await redis.set(lockKey, Date.now(), "EX", interval, "NX");
    retry++;
  }
  if (!locked) {
    return {
      verified: false,
      duplicated: false,
      message: `Lottery pool is under a ${interval}s waiting period, please try again later.`,
    };
  }
  const userLotteryPool = await UserLotteryPool.findOne({ user_id: userId, lottery_pool_id: lotteryPoolId, deleted_time: null });
  const freeLotteryTicketCost = drawCount - lotteryTicketCost - mbCost/25;
  // 重新查询保证查到的是最新的奖池状态
  const lotteryPool: ILotteryPool = await getActiveLotteryPoolById(lotteryPoolId) as ILotteryPool;
  // 1-3抽和4-10抽奖池和中奖几率不同所以要分别计算
  let firstThreeDrawCumulativeProbabilities = 0;
  let nextSixDrawCumulativeProbabilities = 0;
  let userRewards: IUserLotteryRewardItem[] = [];
  let availableRewards: ILotteryRewardItem[] = [];
  let guaranteedRewards: ILotteryRewardItem[] = [];
  // 筛选抽奖奖励, 如果抽奖次数不满足奖励门槛则去掉对应奖励
  for (let reward of lotteryPool.rewards) {
    // 检查本次抽取是否满足保底次数, 如果是则添加奖品
    if (reward.guaranteed_draw_count) {
      for (let guaranteedDrawCount of reward.guaranteed_draw_count) {
        if (lotteryPool.total_draw_amount < guaranteedDrawCount && (lotteryPool.total_draw_amount + drawCount) >= guaranteedDrawCount) {
          guaranteedRewards.push(reward);
        }
      }
    }
    if ((reward.min_reward_draw_amount <= 0 || (reward.min_reward_draw_amount > 0 && lotteryPool.total_draw_amount >= reward.min_reward_draw_amount))
      && (reward.inventory_amount === null || reward.inventory_amount === undefined || reward.inventory_amount > 0)) {
      availableRewards.push(reward);
    }
  }
  const firstThreeThresholds = availableRewards.map(reward => (firstThreeDrawCumulativeProbabilities += reward.first_three_draw_probability));
  const nextSixThresholds = availableRewards.map(reward => (nextSixDrawCumulativeProbabilities += reward.next_six_draw_probability));
  const totalUserDrawAmount = userLotteryPool? userLotteryPool.draw_amount % 10 : 0;
  let itemInventoryDeltaMap: Map<string, number> = new Map<string, number>();
  let rewardNeedVerify: boolean = false;
  // 执行抽奖, 每次抽奖单独判断概率
  for (let i = 1; i<= drawCount; i++) {
    // 根据用户已抽取次数计算当前是第几抽
    let currentDrawNo = totalUserDrawAmount + i;
    let drawResult: { drawResult: IUserLotteryRewardItem, verifyNeeded: boolean};
    if (currentDrawNo <= 3) {
      drawResult = await getDrawResult(userId, firstThreeDrawCumulativeProbabilities, firstThreeThresholds, guaranteedRewards, availableRewards, itemInventoryDeltaMap, userRewards);
    }
    else {
      drawResult = await getDrawResult(userId, nextSixDrawCumulativeProbabilities, nextSixThresholds, guaranteedRewards, availableRewards, itemInventoryDeltaMap, userRewards);
    }
    userRewards.push(drawResult.drawResult);
    rewardNeedVerify = rewardNeedVerify || drawResult.verifyNeeded;
  }
  try {
    // 扣减抽奖资源, 并从奖池中扣除奖励数量, 写入用户抽奖历史和中奖历史
    const drawId = uuidv4();
    const now = Date.now();
    await doTransaction(async (session) => {
      // 扣减用户mb和通用抽奖券
      await User.updateOne({ user_id: userId }, { $inc: { moon_beam: -mbCost, lottery_ticket_amount: -lotteryTicketCost }}, { session: session });
      // 扣减用户奖池抽奖券
      await UserLotteryPool.updateOne(
        { user_id: userId, lottery_pool_id: lotteryPoolId }, 
        { 
          $inc: { free_lottery_ticket_amount: -freeLotteryTicketCost, draw_amount: drawCount },
          $setOnInsert: { created_time: now }
        }, 
        { session: session, upsert: true });
      // 增加用户生涯总抽奖次数并检查徽章
      await incrUserMetric(userId, Metric.TotalLotteryDrawAmount, drawCount, session);
      // 扣减奖池总奖品数量
      for (let reward of lotteryPool.rewards) {
        let inventoryCost = itemInventoryDeltaMap.get(reward.item_id) as number;
        if (reward.inventory_amount && inventoryCost) {
          await LotteryPool.findOneAndUpdate(
            { lottery_pool_id: lotteryPoolId, "rewards.item_id": reward.item_id }, 
            { $inc: { "rewards.$[elem].inventory_amount" : -inventoryCost } }, 
            { arrayFilters: [{ "elem.item_id": reward.item_id }], session: session });
        }
      }
      // 写入用户中奖历史
      await UserLotteryDrawHistory.updateOne(
        { draw_id: drawId },
        {
          user_id: userId,
          draw_time: now,
          lottery_pool_id: lotteryPoolId,
          rewards: userRewards,
          need_verify_twitter: rewardNeedVerify,
          chain_request_id: chainRequestId,
          update_time: now
        }, 
        { session: session, upsert: true }
      );
    }, 3);
    // 增加总抽奖次数
    await LotteryPool.findOneAndUpdate(
      { lottery_pool_id: lotteryPoolId }, 
      { $inc: { total_draw_amount: drawCount } });
    for (let reward of userRewards) {
      if (reward.reward_type === LotteryRewardType.CDK) {
        delete reward.cdk;
      }
    }
    return {
      verified: true,
      duplicated: false,
      message: "Congratulations on winning the following rewards!",
      lottery_pool_id: lotteryPoolId,
      available_draw_time: lotteryPool!.draw_limits === null ? "infinite" :  lotteryPool!.draw_limits - drawCount - (userLotteryPool? userLotteryPool.draw_amount: 0),
      draw_id: drawId,
      rewards: userRewards,
      require_authorization: rewardNeedVerify? AuthorizationType.Twitter : undefined
    }
  } catch (error) {
      console.log(error);
      if (isDuplicateKeyError(error)) {
          return { verified: false, duplicated: true}
      }
      console.error(error);
      Sentry.captureException(error);
      return { verified: false, duplicated: false}
  } 
}

// 抽奖结果计算, 并返回抽到的奖品是否需要验证
async function getDrawResult(userId: string, drawCumulativeProbabilities: number, drawThresholds: number[], 
  guaranteedRewards: ILotteryRewardItem[], 
  availableRewards: ILotteryRewardItem[], 
  itemInventoryDeltaMap: Map<string, number>,
  allDrawResults: IUserLotteryRewardItem[]): Promise<{drawResult: IUserLotteryRewardItem, verifyNeeded: boolean}> {
  let reward: ILotteryRewardItem = drawOnce;
  let verifyNeeded: boolean = false;
  // 优先抽取保底避免无人抽中
  if (guaranteedRewards && guaranteedRewards.length > 0) {
    reward = guaranteedRewards.pop() as ILotteryRewardItem;
  }
  else {
  // 如无保底, 则抽取常规奖品
    const random = Math.random() * drawCumulativeProbabilities;
    for (let j = 0; j < drawThresholds.length; j++) {
      if (random <= drawThresholds[j]) {
        reward = availableRewards[j];
        // 如果奖品是徽章, 则检查用户徽章获取情况, 如果徽章已经领取, 则奖品替换为没中奖
        if (reward.reward_type === LotteryRewardType.Badge) {
          const userBadge = await UserBadges.findOne({ user_id: userId, badge_id: reward.badge_id });
          const userDrawHistory = await UserLotteryDrawHistory.findOne({ user_id: userId, "rewards.badge_id": reward.badge_id });
          if (userBadge || userDrawHistory) {
            reward = drawOnce;
          }
          for (let drawResult of allDrawResults) {
            if (drawResult.reward_type === LotteryRewardType.Badge && drawResult.badge_id === reward.badge_id) {
              reward = drawOnce;
              break;
            }
          }
        } else if (reward.reward_type === LotteryRewardType.CDK) {
          const userDrawHistory = await UserLotteryDrawHistory.findOne({ user_id: userId, "rewards.cdk": reward.cdk });
          if (userDrawHistory) {
            reward = drawOnce;
          }
          for (let drawResult of allDrawResults) {
            if (drawResult.reward_type === LotteryRewardType.CDK && drawResult.cdk === reward.cdk) {
              reward = drawOnce;
              break;
            }
          }
        }
        // 计算库存扣减数量, 如果奖品库存为0则替换奖品为没中奖。 注意: 保底奖品不考虑库存
        if (reward.inventory_amount) {
          const cost = itemInventoryDeltaMap.has(reward.item_id)? itemInventoryDeltaMap.get(reward.item_id) as number + 1 : 1;
          if (cost > reward.inventory_amount) {
            reward = drawOnce;
          }
          if (reward.reward_type !== LotteryRewardType.NoPrize) {
            itemInventoryDeltaMap.set(reward.item_id, cost);
          }
        }
        break;
      }
    }
  }
  // 如果存在需要验证的奖品则返回true
  if (reward.reward_claim_type === 2 || reward.reward_claim_type === 3) {
    verifyNeeded = true;
  }
  const result: IUserLotteryRewardItem = {
    item_id: reward.item_id,
    reward_id: uuidv4(),
    badge_id: reward.badge_id,
    cdk: reward.cdk,
    reward_type: reward.reward_type,
    reward_name: reward.reward_name, 
    icon_url: reward.icon_url, 
    reward_level: reward.reward_level,
    claimed: reward.reward_type === LotteryRewardType.NoPrize,
    reward_claim_type: reward.reward_claim_type, 
    amount: reward.amount
  };
  return { drawResult: result, verifyNeeded: verifyNeeded};
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