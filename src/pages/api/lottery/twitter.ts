import type {NextApiResponse} from "next";
import { createRouter } from 'next-connect';

import { getLotteryPoolById } from '@/lib/lottery/lottery';
import { mustAuthInterceptor, UserContextRequest } from '@/lib/middleware/auth';
import { ILotteryPool, LotteryRewardType } from '@/lib/models/LotteryPool';
import * as response from '@/lib/response/response';

const router = createRouter<UserContextRequest, NextApiResponse>();
router.use(mustAuthInterceptor).get(async (req, res) => {
  const { lottery_pool_id } = req.query;
  if (!lottery_pool_id) {
    res.json(response.invalidParams());
    return;
  }
  const lotteryPoolId = String(lottery_pool_id);
  let postUrl = await createTwitterTopicUrl(lotteryPoolId);
  res.json(response.success({ postUrl: postUrl }));
});

async function createTwitterTopicUrl(lotteryPoolId: string): Promise<string> {
  const lotteryPool = await getLotteryPoolById(lotteryPoolId) as ILotteryPool;
  var postUrl = "https://twitter.com/intent/post?";
  if (lotteryPool.twitter_topic_text) {
      // 把文本的\n替换为%0a
      const text = lotteryPool.twitter_topic_text.replace(/\n/g, "%0a");
      postUrl += `&text=${text}%20`;
  }
  if (lotteryPool.twitter_topic_urls && lotteryPool.twitter_topic_urls.length > 0) {
    postUrl += `&url=${lotteryPool.twitter_topic_urls.join(",")}`;
  }
  if (lotteryPool.twitter_topic_hashtags && lotteryPool.twitter_topic_hashtags.length > 0) {
      postUrl += `&hashtags=${lotteryPool.twitter_topic_hashtags.join(",")}`;
  }
  return postUrl;
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