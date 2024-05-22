import type { NextApiResponse } from "next";
import { createRouter } from 'next-connect';

import { mustAuthInterceptor, UserContextRequest } from '@/lib/middleware/auth';
import { errorInterceptor } from '@/lib/middleware/error';
import { timeoutInterceptor } from '@/lib/middleware/timeout';
import LotteryPool from '@/lib/models/LotteryPool';
import TwitterTopicTweet from '@/lib/models/TwitterTopicTweet';
import UserLotteryPool from '@/lib/models/UserLotteryPool';
import UserTwitter from '@/lib/models/UserTwitter';
import { redis } from '@/lib/redis/client';
import * as response from '@/lib/response/response';

const router = createRouter<UserContextRequest, NextApiResponse>();


const defaultErrorResponse = response.success({
    verified: false,
    message: "Network busy, please try again later.",
})

router.use(errorInterceptor(defaultErrorResponse), mustAuthInterceptor, timeoutInterceptor(defaultErrorResponse, 15000)).post(async (req, res) => {
    const { lottery_pool_id } = req.body;
    if (!lottery_pool_id) {
      res.json(response.invalidParams());
      return;
    }
    const userId = req.userId!;
    const lotteryPool = await LotteryPool.findOne({ lottery_pool_id: lottery_pool_id, deleted_time: null });
    if (!lotteryPool) {
      res.json(response.notFound("Cannot find the specific lottery pool."));
      return;
    }
    const now = Date.now();
    if (lotteryPool.start_time > now || lotteryPool.end_time <= now) {
      res.json(response.success({
        verified: false,
        message: "Lottery pool is not available.",
      }));
      return;
    }
    const userTwitter = await UserTwitter.findOne({ user_id: userId, deleted_time: null });
    if (!userTwitter) {
      res.json(response.success({
          verified: false,
          message: "You should connect your Twitter Account first."
      }));
      return;
    }
    const userLotteryPool = await UserLotteryPool.findOne({ user_id: userId, lottery_pool_id: lottery_pool_id });
    if (!userLotteryPool || !userLotteryPool.twitter_topic_id) {
      res.json(response.success({
        verified: false,
        message: "You should post twitter topic first."
      }));
      return;
    }
    let tweet = await TwitterTopicTweet.findOne({ author_id: userTwitter.twitter_id, topic_id: userLotteryPool.twitter_topic_id }, { _id: 0, tweeted_at: 1 });
    // 一个奖池只需要发一次twitter话题, 不用重复检查
    if (tweet) {
      return {
        verified: true
      };
    }
    else {
      const lockKey = `claim_user_lottery_lock:${userId}:${lottery_pool_id}`;
      // TweetTopic为3分钟
      let interval: number = 3 * 60;
      const locked = await redis.set(lockKey, Date.now(), "EX", interval, "NX");
      if (!locked) {
          return {
              verified: false,
              message: `Verification is under a ${interval}s waiting period, please try again later.`,
          };
      }
      tweet = await TwitterTopicTweet.findOne({ author_id: userTwitter.twitter_id, topic_id: userLotteryPool.twitter_topic_id }, { _id: 0, tweeted_at: 1 });
      if (tweet) {
          return {
            verified: true
          };
      }
    }
});


// this will run if none of the above matches
router.all((req, res) => {
    res.status(405).json({
        error: "Method not allowed",
    });
});

export default router.handler();