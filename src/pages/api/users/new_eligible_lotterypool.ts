import type {NextApiResponse} from "next";
import { PipelineStage } from 'mongoose';
import { createRouter } from 'next-connect';

import { lotteryPoolRequirementSatisfy } from '@/lib/lottery/lottery';
import { mustAuthInterceptor, UserContextRequest } from '@/lib/middleware/auth';
import { errorInterceptor } from '@/lib/middleware/error';
import LotteryPool, { LotteryPoolType } from '@/lib/models/LotteryPool';
import * as response from '@/lib/response/response';

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(errorInterceptor(), mustAuthInterceptor).get(async (req, res) => {
  const userId = String(req.userId);
  const lotteryPools = await getOpenLotteryPools(userId);
  let hasNewEligiblePool = false;
  for (let pool of lotteryPools) {
    const requirementSatisfy = await lotteryPoolRequirementSatisfy(userId, pool.lottery_pool_id);
    if (requirementSatisfy.meet_requirement && pool.user_lottery_pool.length === 0) {
      hasNewEligiblePool = true;
      break;
    }
  }
  return res.json(response.success({ new_eligible_pool_exists: hasNewEligiblePool }));
});

async function getOpenLotteryPools(userId: string) {
  const now = Date.now();
  const pipeline: PipelineStage[] = [{
    $match: {
      active: true,
      type: LotteryPoolType.Public,
      start_time: { $lte: now },
      end_time: { $gte: now}
  }},
  {
    $lookup: {
      from: "user_lottery_pool",
      let: { lottery_pool_id: '$lottery_pool_id' },
      pipeline: [{
        $match: { $expr: { $and: [{ $eq: ['$user_id', userId] }, { $eq: ['$lottery_pool_id', '$$lottery_pool_id'] }] } },
      }],
      as: "user_lottery_pool"
    }
  }]
  const lotteryPools = await LotteryPool.aggregate(pipeline);
  return lotteryPools;
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