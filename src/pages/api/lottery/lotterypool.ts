import type {NextApiResponse} from "next";
import { createRouter } from 'next-connect';

import { mustAuthInterceptor, UserContextRequest } from '@/lib/middleware/auth';
import { errorInterceptor } from '@/lib/middleware/error';
import { ILotteryPool } from '@/lib/models/LotteryPool';
import User from '@/lib/models/User';
import UserLotteryPool from '@/lib/models/UserLotteryPool';
import * as response from '@/lib/response/response';
import { canClaimPremiumBenifits, getLotteryPoolById } from '@/lib/lottery/lottery';

const router = createRouter<UserContextRequest, NextApiResponse>();
router.use(errorInterceptor(), mustAuthInterceptor).get(async (req, res) => {
  const { lottery_pool_id } = req.query;
  if (!lottery_pool_id) {
    res.json(response.invalidParams());
  }
  const userId = String(req.userId);
  const lotteryPoolId = String(lottery_pool_id);
  const lotteryPool = await getLotteryPoolById(lotteryPoolId) as ILotteryPool;
  if (!lotteryPool) {
    res.json(response.invalidParams("The lottery pool is not opened or has been closed."));
  }
  const user = await User.findOne({ user_id: userId });
  const userLotteryPool = await UserLotteryPool.findOne({ user_id: userId, lottery_pool_id: lotteryPoolId, deleted_time: null });
  const notifiyPremiumBenifitsClaim = await canClaimPremiumBenifits(userId, lotteryPoolId);
  let restDrawAmount: string | number = 0;
  if (lotteryPool.draw_limits === null) {
    restDrawAmount = "infinite";
  }
  else {
    restDrawAmount = userLotteryPool ? lotteryPool.draw_limits - userLotteryPool.draw_amount : lotteryPool.draw_limits;
  }
  const userFreeLotteryTicketAmount = userLotteryPool ? userLotteryPool.free_lottery_ticket_amount : 0;
  const firstTwitterTopicVerified = userLotteryPool? userLotteryPool.first_twitter_topic_verified: false;
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
    can_claim_premium_benifits: notifiyPremiumBenifitsClaim,
    first_twitter_topic_verified: firstTwitterTopicVerified,
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