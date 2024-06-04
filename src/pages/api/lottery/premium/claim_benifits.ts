import type {NextApiResponse} from "next";
import { createRouter } from 'next-connect';

import { mustAuthInterceptor, UserContextRequest } from '@/lib/middleware/auth';
import { errorInterceptor } from '@/lib/middleware/error';
import { ILotteryPool } from '@/lib/models/LotteryPool';
import UserLotteryPool from '@/lib/models/UserLotteryPool';
import * as response from '@/lib/response/response';
import { canClaimPremiumBenifits, getLotteryPoolById } from '@/lib/lottery/lottery';

const router = createRouter<UserContextRequest, NextApiResponse>();
router.use(errorInterceptor(), mustAuthInterceptor).post(async (req, res) => {
  const { lottery_pool_id } = req.body;
  if (!lottery_pool_id) {
    res.json(response.invalidParams());
    return;
  }
  const userId = String(req.userId);
  const lotteryPoolId = String(lottery_pool_id);
  const lotteryPool = await getLotteryPoolById(lotteryPoolId) as ILotteryPool;
  if (!lotteryPool) {
    res.json(response.invalidParams("The lottery pool is not opened or has been closed."));
    return;
  }
  const canClaimBenifits = await canClaimPremiumBenifits(userId, lotteryPoolId);
  if (canClaimBenifits) {
    await UserLotteryPool.updateOne(
      { user_id: userId, lottery_pool_id: lotteryPoolId }, 
      { 
        $inc: { free_lottery_ticket_amount: 3 }, 
        $set: { premium_benifits_claimed: true},
        $setOnInsert: { created_time: Date.now() }
      }, 
      { upsert: true });
    res.json(response.success({ message: "You have claimed all premium benifits for this lottery pool!" }));
    return;
  }
  else {
    res.json(response.success({ message: "You have already claimed all premium benifits for this lottery pool!" }));
    return;
  }
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