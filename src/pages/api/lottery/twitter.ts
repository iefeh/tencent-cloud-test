import type {NextApiResponse} from "next";
import { createRouter } from 'next-connect';
import { v4 as uuidv4 } from 'uuid';

import { maybeAuthInterceptor, UserContextRequest } from '@/lib/middleware/auth';
import TwitterTopic from '@/lib/models/TwitterTopic';
import { increaseUserMoonBeam } from '@/lib/models/User';
import UserLotteryPool from '@/lib/models/UserLotteryPool';
import doTransaction from '@/lib/mongodb/transaction';
import * as response from '@/lib/response/response';

const router = createRouter<UserContextRequest, NextApiResponse>();
router.use(maybeAuthInterceptor).post(async (req, res) => {
  let postUrl = await createTwitterTopicReward(req, res);
  // 如果用户在当前奖池已经创建过twitter topic则返回空url
  res.json(response.success({ postUrl: postUrl }));
});

async function createTwitterTopicReward(req: any, res: any): Promise<string> {
  const { must_contains_text,hash_tags,mention_usernames,reply_to_tweet_id,start_time,end_time,delay_seconds,retweet_excluded,quote_excluded, lottery_pool_id } = req.body;
  // 一个奖池只需要一个twitter topic, 如果已经存在则不再创建
  const userLotteryPool = await UserLotteryPool.findOne({ user_id: req.userId, lottery_pool_id: lottery_pool_id, deleted_time: null });
  if (userLotteryPool && userLotteryPool.twitter_topic_id) {
      return "";
  }
  var postUrl = "https://twitter.com/intent/post?";
  let hasAndOperator = false;
  if (mention_usernames && mention_usernames.length > 0) {
      let mentions = "";
      for (let username of mention_usernames) {
          mentions += `@${username}%20`;
      }
      hasAndOperator = true;
      postUrl += `&text=${mentions}`;
  }
  if (must_contains_text) {
      // 把文本的\n替换为%0a
      const text = must_contains_text.replace(/\n/g, "%0a");
      postUrl += hasAndOperator? `${text}%20` : `&text=${text}%20`;
  }
  if (hash_tags && hash_tags.length > 0) {
      const tags = hash_tags.join(",");
      postUrl += `&hashtags=${tags}`;
  }
  const topicId = uuidv4();
  const topic = new TwitterTopic({
      id: topicId,
      hash_tags: hash_tags,
      must_contains_text: must_contains_text,
      mention_usernames: mention_usernames,
      reply_to_tweet_id: reply_to_tweet_id,
      start_time: start_time,
      end_time: end_time,
      delay_seconds: delay_seconds,
      retweet_excluded: retweet_excluded,
      // 不能设置为true，twitter默认把原始推文归类为reply类型.
      reply_excluded: false, 
      quote_excluded: quote_excluded,
      synced: false,
      active: false,
  }); 
  await doTransaction(async session => {
    const opts = {session};
    await topic.save(opts);
    await increaseUserMoonBeam(req.userId, 20, session);
    await UserLotteryPool.updateOne(
      { user_id: req.userId, 
        lottery_pool_id: lottery_pool_id}, 
      { 
        $set: { twitter_topic_id: topicId },
        $setOnInsert: { created_time: Date.now() }
      },
      { upsert: true, session: session });
  });
  return postUrl;
}