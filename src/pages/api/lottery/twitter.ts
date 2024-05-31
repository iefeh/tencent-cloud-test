import type {NextApiResponse} from "next";
import { createRouter } from 'next-connect';

import {
    constructMoonBeamAudit, constructVerifyResponse, getLotteryPoolById
} from '@/lib/lottery/lottery';
import { mustAuthInterceptor, UserContextRequest } from '@/lib/middleware/auth';
import { ILotteryPool, LotteryTwitterTopic } from '@/lib/models/LotteryPool';
import { increaseUserMoonBeam } from '@/lib/models/User';
import UserLotteryDrawHistory, {
    IUserLotteryDrawHistory
} from '@/lib/models/UserLotteryDrawHistory';
import UserLotteryPool from '@/lib/models/UserLotteryPool';
import doTransaction from '@/lib/mongodb/transaction';
import * as response from '@/lib/response/response';

const router = createRouter<UserContextRequest, NextApiResponse>();
router.use(mustAuthInterceptor).get(async (req, res) => {
  const { lottery_pool_id, draw_id } = req.query;
  if (!lottery_pool_id || !draw_id) {
    res.json(response.invalidParams());
    return;
  }
  const userId = String(req.userId);
  const lotteryPoolId = String(lottery_pool_id);
  const drawId = String(draw_id);
  const lotteryPool = await getLotteryPoolById(lotteryPoolId) as ILotteryPool;
  if (!lotteryPool) {
    res.json(response.invalidParams(constructVerifyResponse(false, "The lottery pool is not opened or has been closed.")));
    return;
  }
  const drawHistory = await UserLotteryDrawHistory.findOne({ user_id: userId, draw_id: drawId }) as IUserLotteryDrawHistory;
  if (!drawHistory) {
    res.json(response.invalidParams(constructVerifyResponse(false, "Cannot find a draw record for this claim.")));
    return;
  }
  const maxClaimType = Math.max(...drawHistory.rewards.map(reward => (reward.reward_claim_type)));
  var postUrl = "https://twitter.com/intent/post?";
  const twitterTopic = lotteryPool.twitter_topics.find(topics => (topics.reward_claim_type === maxClaimType)) as LotteryTwitterTopic; 
  if (!twitterTopic) {
    res.json(response.serverError(constructVerifyResponse(false, "Cannot find a matching reward type.")));
    return;
  }
  if (twitterTopic.twitter_topic_text) {
      // 把文本的\n替换为%0a
      const text = twitterTopic.twitter_topic_text.replace(/\n/g, "%0a");
      postUrl += `&text=${text}%20`;
  }
  if (twitterTopic.twitter_topic_urls && twitterTopic.twitter_topic_urls.length > 0) {
    postUrl += `&url=${twitterTopic.twitter_topic_urls.join(",")}`;
  }
  if (twitterTopic.twitter_topic_hashtags && twitterTopic.twitter_topic_hashtags.length > 0) {
      postUrl += `&hashtags=${twitterTopic.twitter_topic_hashtags.join(",")}`;
  }
  let canClaimFirstTwitterReward = true;
  const userLotteryPool = await UserLotteryPool.findOne({ user_id: userId, lottery_pool_id: lotteryPoolId, deleted_time: null });
  // 假验证, 只要用户点击了share按钮就直接发放首推奖励
  if (userLotteryPool && userLotteryPool.first_twitter_topic_verified) {
    canClaimFirstTwitterReward = false;
  }
  if (canClaimFirstTwitterReward) {
    const moonBeamAudit = constructMoonBeamAudit(userId, lotteryPoolId, "", 20);
    doTransaction( async session => {
      await UserLotteryPool.updateOne(
        { user_id: userId, lottery_pool_id: lotteryPoolId, deleted_time: null },
        { 
          $set: { first_twitter_topic_verified: true },
          $setOnInsert: { created_time: Date.now() }
        },
        { upsert: true, session: session }
      );
      await moonBeamAudit.save(session);
      await increaseUserMoonBeam(userId, lotteryPool.twitter_verify_mb_reward_amount, session);
    });
  }
  res.json(response.success({ postUrl: postUrl }));
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