import type {NextApiResponse} from "next";
import { createRouter } from 'next-connect';

import {
    canClaimPremiumBenifits, enrichRequirementsInfo, getActiveLotteryPoolById,
    lotteryRequirementSatisfy
} from '@/lib/lottery/lottery';
import { mustAuthInterceptor, UserContextRequest } from '@/lib/middleware/auth';
import { errorInterceptor } from '@/lib/middleware/error';
import { ILotteryPool } from '@/lib/models/LotteryPool';
import LotteryPoolRequirement from '@/lib/models/LotteryPoolRequirements';
import User from '@/lib/models/User';
import UserLotteryPool from '@/lib/models/UserLotteryPool';
import * as response from '@/lib/response/response';

const router = createRouter<UserContextRequest, NextApiResponse>();
router.use(errorInterceptor(), mustAuthInterceptor).get(async (req, res) => {
  const { lottery_pool_id } = req.query;
  if (!lottery_pool_id) {
    return res.json(response.invalidParams());
  }
  const userId = String(req.userId);
  const lotteryPoolId = String(lottery_pool_id);
  const lotteryPool = await getActiveLotteryPoolById(lotteryPoolId) as ILotteryPool;
  if (!lotteryPool) {
    return res.json(response.invalidParams("The lottery pool is not opened or has been closed."));
  }
  const user = await User.findOne({ user_id: userId });
  const userLotteryPool = await UserLotteryPool.findOne({ user_id: userId, lottery_pool_id: lotteryPoolId, deleted_time: null });
  const requirements = await LotteryPoolRequirement.find({ lottery_pool_id: lotteryPoolId }, { type: 1, description: 1, properties: 1, _id: 0 });
  await enrichRequirementsInfo(requirements);
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
  const requirementSatisfy = await lotteryRequirementSatisfy(userId, lotteryPoolId); 
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
    icon_url: lotteryPool.icon_url,
    name: lotteryPool.name,
    title: lotteryPool.title,
    start_time: lotteryPool.start_time,
    end_time: lotteryPool.end_time,
    draw_limits: lotteryPool.draw_limits,
    rest_draw_amount: restDrawAmount,
    user_s1_lottery_ticket_amount: user.lottery_ticket_amount,
    user_free_lottery_ticket_amount: userFreeLotteryTicketAmount,
    user_mb_amount: user.moon_beam,
    user_meet_requirement_type: requirementSatisfy.requirement_type,
    user_meet_requirement: requirementSatisfy.meet_requirement,
    can_claim_premium_benifits: notifiyPremiumBenifitsClaim,
    first_twitter_topic_verified: firstTwitterTopicVerified,
    requirements: requirements,
    rewards: rewards
  }));
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