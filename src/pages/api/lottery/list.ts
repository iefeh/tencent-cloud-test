import type {NextApiResponse} from "next";
import { createRouter } from 'next-connect';

import { mustAuthInterceptor, UserContextRequest } from '@/lib/middleware/auth';
import { errorInterceptor } from '@/lib/middleware/error';
import LotteryPool from '@/lib/models/LotteryPool';
import * as response from '@/lib/response/response';

const router = createRouter<UserContextRequest, NextApiResponse>();
router.use(errorInterceptor(), mustAuthInterceptor).get(async (req, res) => {
  const now: number = Date.now();
  const lotteryPools = await LotteryPool.find({ start_time: {$lte: now}, end_time: {$gte: now} });
  if (!lotteryPools || lotteryPools.length === 0) {
    res.json(response.invalidParams("No live lottery pool found!"));
    return;
  }
  let result: any[] = [];
  for (let pool of lotteryPools) {
    result.push(pool.lottery_pool_id);
  }
  res.json(response.success({ lottery_pool_ids: result }));
  return;
});

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