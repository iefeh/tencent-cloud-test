import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import doTransaction from "@/lib/mongodb/transaction";
import * as response from "@/lib/response/response";
import * as Sentry from "@sentry/nextjs";
import {errorInterceptor} from '@/lib/middleware/error';
import logger from "@/lib/logger/winstonLogger";
import LotteryPool, { ILotteryPool, LotteryRewardItem } from "@/lib/models/LotteryPool";
import {mustAuthInterceptor, UserContextRequest} from "@/lib/middleware/auth";
import {promiseSleep} from "@/lib/common/sleep";
import { redis } from "@/lib/redis/client";
import User, { IUser } from "@/lib/models/User";
import UserLotteryDrawHistory, { IUserLotteryRewardItem } from "@/lib/models/UserLotteryDrawHistory";
import UserLotteryPool, { IUserLotteryPool } from "@/lib/models/UserLotteryPool";
import { Metric, incrUserMetric } from "@/lib/models/UserMetrics";
import {v4 as uuidv4} from "uuid";

const defaultErrorResponse = response.success({
  verified: false,
  message: "Network busy, please try again later.",
})

const router = createRouter<UserContextRequest, NextApiResponse>();
router.use(errorInterceptor(), mustAuthInterceptor).post(async (req, res) => {
  const { lottery_pool_id, draw_count, lottery_ticket_cost, mb_cost } = req.body;
  const validDrawCount = [1, 3, 5]; 
  if (!draw_count || !validDrawCount.includes(draw_count) || lottery_ticket_cost < 0 || mb_cost < 0) {
    res.json(response.invalidParams());
  }
  const lotteryPool = await LotteryPool.findOne({ lottery_pool_id: lottery_pool_id });
  if (!lotteryPool || lotteryPool.end_time < Date.now()) {
    res.json(response.invalidParams({ message: "Invalid lottery pool id or lottery pool is closed." }));
  }
  try {
    const user = await User.findOne({ user_id: req.userId });
    const userLotteryPool = await UserLotteryPool.findOne({ user_id: req.userId, lottery_pool_id: lottery_pool_id });
    const canDraw = await verify(lottery_pool_id, draw_count, lottery_ticket_cost, mb_cost, user, userLotteryPool, lotteryPool);
    if (!canDraw.verified) {
      res.json(response.invalidParams(canDraw));
    }
    else {
      let drawResult = await draw(req.userId!, lottery_pool_id, draw_count, lottery_ticket_cost, mb_cost, userLotteryPool);
      if (drawResult.success) {
        res.json(response.success(drawResult));
      }
      else {
        res.json(response.serverError(drawResult));
      }
    }
  } catch (error) {
    logger.error(error);
    Sentry.captureException(error);
    res.status(500).json(defaultErrorResponse);
  }
});

async function verify(lotteryPoolId: string, drawCount: number, lotteryTicketCost: number, mbCost: number, user: IUser, userLotteryPool: IUserLotteryPool, lotteryPool: ILotteryPool): Promise<any> {
  const lockKey = `claim_draw_lock:${lotteryPoolId}:${user.user_id}`;
  // 锁定用户抽奖资源10秒
  let interval: number = 10;
  const locked = await redis.set(lockKey, Date.now(), "EX", interval, "NX");
  if (!locked) {
    return {
      verified: false,
      message: `You may perform a lottery draw per ${interval}s, please try again later.`,
    };
  }
  const userS1LotteryTicketAmount = user.lottery_ticket_amount;
  const userMbAmount = user.moon_beam;
  const userAvailableDrawCount = lotteryPool.draw_limits? lotteryPool.draw_limits - (userLotteryPool ? userLotteryPool.draw_amount : 0) : 1000;
  // 验证用户是否还有可用的抽奖次数
  if (userAvailableDrawCount < drawCount) {
    return {
      verified: false,
      message: `In this pool you have ${userAvailableDrawCount} draw times left however you choose to draw ${drawCount} times.`
    }
  }
  // 验证用户本次抽奖需要消耗的资源, 默认先消耗当前奖池的免费抽奖券, 然后是其他资源, 如果资源不足或者与当前抽奖次数不匹配则返回错误信息
  if (mbCost%25 !== 0 || mbCost > userMbAmount) {
    return {
      verified: false,
      message: "Invalid moon beam cost. The moon beam cost should be mutiples of 25 or you don't have enough moon beams."
    };
  }
  if (userS1LotteryTicketAmount < lotteryTicketCost) {
    return {
      verified: false,
      message: `Invalid resource cost, you choose to use ${lotteryTicketCost} S1 tickets, however you have only ${userS1LotteryTicketAmount} S1 tickets.`
    };
  }
  let availableResourceDrawCount = 0;
  if (userLotteryPool) {
    if (userLotteryPool.free_lottery_ticket_amount >= drawCount) {
      availableResourceDrawCount = drawCount;
    }
    else {
      availableResourceDrawCount = userLotteryPool.free_lottery_ticket_amount;
    }
  }
  availableResourceDrawCount += lotteryTicketCost + mbCost/25;
  if (availableResourceDrawCount > drawCount) {
    return {
      verified: false,
      message: `Invalid resource cost, you are going to draw ${drawCount} times, however the resource you choose can draw ${availableResourceDrawCount} times.`
    };
  }
  else if (availableResourceDrawCount < drawCount) {
    return {
      verified: false,
      message: `No enough resource, you are going to draw ${drawCount} times, however the resource you choose can draw ${availableResourceDrawCount} times.`
    }
  }
  return {
    verified: true
  };
}

async function draw(userId: string, lotteryPoolId: string, drawCount: number, lotteryTicketCost: number, mbCost: number, userLotteryPool: IUserLotteryPool): Promise<any> {
  const lockKey = `claim_draw_lock:${lotteryPoolId}`;
  // 锁定奖池1秒
  let interval: number = 1;
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
      success: false,
      message: `Lottery pool is under a ${interval}s waiting period, please try again later.`,
    };
  }
  const freeLotteryTicketCost = drawCount - lotteryTicketCost - mbCost/25;
  // 重新查询保证查到的是最新的奖池状态
  const lotteryPool: ILotteryPool | null = await LotteryPool.findOne({ lottery_pool_id: lotteryPoolId });
  // 1-3抽和4-10抽奖池和中奖几率不同所以要分别计算
  let firstThreeDrawCumulativeProbabilities = 0;
  let nextSixDrawCumulativeProbabilities = 0;
  let result: IUserLotteryRewardItem[] = [];
  let availableRewards: LotteryRewardItem[] = [];
  let granteedRewards: LotteryRewardItem[] = [];
  // 筛选抽奖奖励, 如果抽奖次数不满足奖励门槛则去掉对应奖励
  for (let reward of lotteryPool!.rewards) {
    // 检查本次抽取是否满足保底次数, 如果是则添加奖品
    for (let granteedDrawCount of reward.granted_draw_count) {
      if (lotteryPool!.total_draw_amount < granteedDrawCount && (lotteryPool!.total_draw_amount + drawCount) >= granteedDrawCount) {
        granteedRewards.push(reward);
      }
    }
    if ((reward.min_reward_draw_amount <= 0 || (reward.min_reward_draw_amount > 0 && lotteryPool!.total_draw_amount >= reward.min_reward_draw_amount))
      && (reward.inventory_amount === null || reward.inventory_amount > 0)) {
      availableRewards.push(reward);
    }
  }
  const firstThreeThresholds = availableRewards.map(reward => (firstThreeDrawCumulativeProbabilities += reward.first_three_draw_probability));
  const nextSixThresholds = availableRewards.map(reward => (nextSixDrawCumulativeProbabilities += reward.next_six_draw_probability));
  const totalUserDrawAmount = userLotteryPool? userLotteryPool.draw_amount % 10 : 0;
  let itemInventoryDeltaMap: Map<string, number> = new Map<string, number>();
  let rewardNeedVerify: boolean = false;
  let currentRewardNeedVerify: boolean = false;
  // 执行抽奖, 每次抽奖单独判断概率
  for (let i = 1; i<= drawCount; i++) {
    // 根据用户已抽取次数计算当前是第几抽
    let currentDrawNo = totalUserDrawAmount + i;
    if (currentDrawNo <= 3) {
      currentRewardNeedVerify = getDrawResult(firstThreeDrawCumulativeProbabilities, firstThreeThresholds, granteedRewards, availableRewards, itemInventoryDeltaMap, result);
    }
    else {
      currentRewardNeedVerify = getDrawResult(nextSixDrawCumulativeProbabilities, nextSixThresholds, granteedRewards, availableRewards, itemInventoryDeltaMap, result);
    }
    rewardNeedVerify = rewardNeedVerify || currentRewardNeedVerify;
  }
  // 扣减抽奖资源, 并从奖池中扣除奖励数量, 写入用户抽奖历史和中奖历史
  const drawId = uuidv4();
  await doTransaction(async session => {
    const now = Date.now();
    // 扣减用户mb和通用抽奖券
    await User.updateOne({ user_id: userId }, { $inc: { moon_beam: -mbCost, lottery_ticket_amount: -lotteryTicketCost }}, { session: session });
    // 扣减用户奖池抽奖券
    await UserLotteryPool.updateOne(
      { user_id: userId, lottery_pool_id: lotteryPoolId }, 
      { $inc: { free_lottery_ticket_amount: -freeLotteryTicketCost, draw_amount: drawCount }}, 
      { session: session, upsert: true });
    // 增加用户生涯总抽奖次数并检查徽章
    await incrUserMetric(userId, Metric.TotalLotteryDrawAmount, drawCount, session);
    // 增加总抽奖次数
    await LotteryPool.findOneAndUpdate(
      { lottery_pool_id: lotteryPoolId }, 
      { $inc: { total_draw_amount: drawCount }, updated_time: now }, 
      { session: session });
    // 扣减奖池总奖品数量
    lotteryPool!.rewards.map(async reward => {
      let inventoryDelta = itemInventoryDeltaMap.get(reward.item_id);
      if (reward.inventory_amount !== null && inventoryDelta && inventoryDelta < 0) {
        await LotteryPool.findOneAndUpdate(
          { lottery_pool_id: lotteryPoolId, "rewards.item_id": reward.item_id }, 
          { $inc: { "rewards.$[elem].inventory_amount" : inventoryDelta } }, 
          { arrayFilters: [{ "elem.item_id": reward.item_id }], session: session });
      }
    });
    // 写入用户中奖历史
    let userDrawHistory = new UserLotteryDrawHistory({
      draw_id: drawId,
      draw_time: now,
      user_id: userId,
      lottery_pool_id: lotteryPoolId,
      rewards: result,
      need_verify_twitter: rewardNeedVerify,
      update_time: now
    });
    await userDrawHistory.save();
  });
  return {
    success: true,
    message: "Congratulations on winning the following rewards!",
    lottery_pool_id: lotteryPoolId,
    available_draw_time: lotteryPool!.draw_limits === null ? "infinite" :  lotteryPool!.draw_limits - drawCount - userLotteryPool.draw_amount,
    draw_id: drawId,
    rewards: result
  }
}

// 抽奖结果计算, 并返回抽到的奖品是否需要验证
function getDrawResult(drawCumulativeProbabilities: number, drawThresholds: number[], granteedRewards: LotteryRewardItem[], availableRewards: LotteryRewardItem[], itemInventoryDeltaMap: Map<string, number>, result: IUserLotteryRewardItem[]): boolean {
  let reward: LotteryRewardItem;
  let rewardNeedVerify: boolean = false;
  // 优先抽取保底避免无人抽中
  if (granteedRewards && granteedRewards.length > 0) {
    reward = granteedRewards.pop()!;
  }
  else {
  // 如无保底, 则抽取常规奖品
    const random = Math.random() * drawCumulativeProbabilities;
    for (let j = 0; j < drawThresholds.length; j++) {
      if (random <= drawThresholds[j]) {
        reward = availableRewards[j];
        // 计算库存扣减数量, 注意: 保底奖品不考虑库存
        let inventoryDelta = -1;
        if (itemInventoryDeltaMap.has(reward.item_id)) {
          inventoryDelta = itemInventoryDeltaMap.get(reward.item_id)! - 1;
        }
        itemInventoryDeltaMap.set(reward.item_id, inventoryDelta);
        break;
      }
    }
  }
  // 如果存在需要验证的奖品则返回true
  if (reward!.reward_claim_type === 2 || reward!.reward_claim_type === 3) {
    rewardNeedVerify = true;
  }
  result.push({
    item_id: reward!.item_id,
    reward_id: uuidv4(),
    reward_type: reward!.reward_type,
    reward_name: reward!.reward_name, 
    icon_url: reward!.icon_url, 
    reward_level: reward!.reward_level,
    claimed: false,
    reward_claim_type: reward!.reward_claim_type, 
    amount: reward!.amount
  });
  return rewardNeedVerify;
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