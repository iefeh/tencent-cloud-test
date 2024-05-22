import type {NextApiResponse} from "next";
import { createRouter } from 'next-connect';

import { mustAuthInterceptor, UserContextRequest } from '@/lib/middleware/auth';
import { errorInterceptor } from '@/lib/middleware/error';
import LotteryPool from '@/lib/models/LotteryPool';
import User from '@/lib/models/User';
import UserLotteryPool from '@/lib/models/UserLotteryPool';
import * as response from '@/lib/response/response';

const router = createRouter<UserContextRequest, NextApiResponse>();
router.use(errorInterceptor(), mustAuthInterceptor).get(async (req, res) => {
  const { lottery_pool_id } = req.query;
  const lotteryPool = await LotteryPool.findOne({ lottery_pool_id: lottery_pool_id, deleted_time: null });
  if (!lotteryPool) {
    res.json(response.invalidParams("Cannot find the specified lottery pool!"));
  }
  const user = await User.findOne({ user_id: req.userId });
  const userLotteryPool = await UserLotteryPool.findOne({ user_id: req.userId, lottery_pool_id: lottery_pool_id });
  let restDrawAmount: string | number = 0;
  if (lotteryPool.draw_limits === null) {
    restDrawAmount = "infinite";
  }
  else {
    restDrawAmount = userLotteryPool ? lotteryPool.draw_limits - userLotteryPool.draw_amount : lotteryPool.draw_limits;
  }
  const userFreeLotteryTicketAmount = userLotteryPool ? userLotteryPool.free_lottery_ticket_amount : 0;
  let rewards: any[] = [];
  for (let reward of lotteryPool.rewards) {
    rewards.push({
      icon_url: reward.icon_url,
      reward_type: reward.reward_type,
      reward_name: reward.reward_name, 
      reward_level: reward.reward_level,
      reward_claim_type: reward. reward_claim_type,
      amount: reward.amount
    });
  }
  res.json(response.success({ 
    lottery_pool_id: lotteryPool.lottery_pool_id,
    start_time: lotteryPool.start_time,
    end_time: lotteryPool.end_time,
    draw_limits: lotteryPool.draw_limits,
    rest_draw_amount: restDrawAmount,
    total_draw_amount: lotteryPool.total_draw_amount,
    user_s1_lottery_ticket_amount: user.lottery_ticket_amount,
    user_free_lottery_ticket_amount: userFreeLotteryTicketAmount,
    user_mb_amount: user.moon_beam,
    rewards: rewards
  }));
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