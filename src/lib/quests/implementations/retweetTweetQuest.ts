import { IQuest } from '@/lib/models/Quest';
import { checkClaimableResult, claimRewardResult, RetweetTweet } from '@/lib/quests/types';
import { queryUserTwitterAuthorization, UserTwitterAuthorization } from '@/lib/quests/implementations/connectTwitterQuest';
import { AuthorizationType } from '@/lib/authorization/types';
import UserMetrics, { Metric } from '@/lib/models/UserMetrics';
import doTransaction from '@/lib/mongodb/transaction';
import QuestAchievement from '@/lib/models/QuestAchievement';
import { twitterOAuthProvider } from '@/lib/authorization/provider/twitter';
import { isAxiosError } from 'axios';
import { deleteAuthToken } from '@/lib/authorization/provider/util';
import { redis } from '@/lib/redis/client';
import { QuestBase } from '@/lib/quests/implementations/base';
import logger from '@/lib/logger/winstonLogger';
import { sendBadgeCheckMessages } from '@/lib/kafka/client';

export class RetweetTweetQuest extends QuestBase {
  constructor(quest: IQuest) {
    super(quest);
  }

  static async retweetTweet(twitterAuth: UserTwitterAuthorization, tweetId: string): Promise<{ retweeted: boolean; require_authorization: boolean }> {
    // 检查是否限流
    const rateLimitedKey = `twitter_retweet:${twitterAuth.twitter_id}`;
    const rateLimited = await redis.get(rateLimitedKey);
    if (rateLimited) {
      logger.warn(`user ${twitterAuth.user_id} twitter ${twitterAuth.twitter_id} retweet limited by redis`);
      return {
        retweeted: false,
        require_authorization: false,
      };
    }

    // 以用户名义执行转推
    const twitterRequest = twitterOAuthProvider.createRequest(twitterAuth.token);
    const retweetURL = `https://api.twitter.com/2/users/${twitterAuth.twitter_id}/retweets`;
    // { data: { retweeted: true, rest_id: '1759769737817669636' } }
    // 重复转推会报错 {errors:[Array],title:'Invalid Request',detail:'One or more parameters to your request was invalid.',type:'https://api.twitter.com/2/problems/invalid-request'}
    try {
      await twitterRequest.post(retweetURL, {
        tweet_id: tweetId,
      });
      return {
        retweeted: true,
        require_authorization: false,
      };
    } catch (error) {
      logger.error(`user ${twitterAuth.user_id} twitter ${twitterAuth.twitter_id} retweetc error: ${error}`);
      if (!isAxiosError(error)) {
        return {
          retweeted: false,
          require_authorization: false,
        };
      }
      // 检查转推响应
      const response = error.response!;
      // 当前无权限，移除用户的授权token
      if (response.status === 403 || response.data.error_description == 'Value passed for the token was invalid.') {
        logger.warn(
          `user ${twitterAuth.user_id} twitter ${twitterAuth.twitter_id} retweet invalidated: ${JSON.stringify(response.data)}`,
        );
        await deleteAuthToken(twitterAuth.token);
        return {
          retweeted: false,
          require_authorization: true,
        };
      }
      // 当前是重复转推，则认为任务已经完成
      if (response.status === 400 && response.data.detail === 'One or more parameters to your request was invalid.') {
        return {
          retweeted: true,
          require_authorization: false,
        };
      }
      // 当前是否已经被限流，需要添加限流处理
      if (response.status === 429) {
        logger.warn(
          `user ${twitterAuth.user_id} twitter ${twitterAuth.twitter_id} retweet rate limited: ${JSON.stringify(response.data)}`,
        );
        const resetAt = response.headers['x-rate-limit-reset'];
        if (resetAt) {
          const wait = Number(resetAt) - Math.ceil(Date.now() / 1000);
          if (wait) {
            await redis.setex(rateLimitedKey, wait, 1);
          }
        }
      }
      return {
        retweeted: false,
        require_authorization: false,
      };
    }
  }

  async checkClaimable(userId: string): Promise<checkClaimableResult> {
    // 要求用户绑定了twitter账号且目前授权token有效
    const twitterAuth = await queryUserTwitterAuthorization(userId);
    if (!twitterAuth) {
      return {
        claimable: false,
        require_authorization: AuthorizationType.Twitter,
      };
    }
    const questProp = this.quest.properties as RetweetTweet;
    const retweetResult = await RetweetTweetQuest.retweetTweet(twitterAuth, questProp.tweet_id);
    let tip = "";
    if (!retweetResult.retweeted) {
      tip = "Something wrong, please try again later.";
    }
    if (retweetResult.require_authorization) {
      tip = "You should connect your Twitter Account first.";
    }
    return {
      claimable: retweetResult.retweeted,
      require_authorization: retweetResult.require_authorization ? AuthorizationType.Twitter : undefined,
      tip: tip,
      extra: twitterAuth.twitter_id,
    };
  }

  async addUserAchievement(userId: string, verified: boolean): Promise<void> {
    const now = Date.now();
    const inserts: any = {};
    if (verified) {
      inserts.verified_time = now;
    }
    // 添加用户任务完成记录与转推次数
    await doTransaction(async (session) => {
      await QuestAchievement.updateOne(
        { user_id: userId, quest_id: this.quest.id, verified_time: null },
        {
          $set: inserts,
          $setOnInsert: {
            created_time: now,
          },
        },
        { upsert: true },
      );
      await UserMetrics.updateOne(
        { user_id: userId },
        {
          $inc: { [Metric.RetweetCount]: 1 },
          $setOnInsert: {
            created_time: now,
          },
        },
        { upsert: true, session: session },
      );
    });
    await sendBadgeCheckMessages(userId, {
      [Metric.RetweetCount]: 1,
      [Metric.TwitterConnected]: 1,
    });
  }

  async claimReward(userId: string): Promise<claimRewardResult> {
    const claim = await this.checkClaimable(userId);
    if (!claim.claimable) {
      return {
        verified: claim.claimable,
        require_authorization: claim.require_authorization,
        tip: claim.tip,
      };
    }
    // 污染twitter，确保同一个twitter单任务只能获取一次奖励
    const taint = `${this.quest.id},${AuthorizationType.Twitter},${claim.extra}`;
    const rewardDelta = await this.checkUserRewardDelta(userId);
    // retweet时额外添加用户的转推次数
    const result = await this.saveUserReward(userId, taint, rewardDelta, null, async (session) => {
      await UserMetrics.updateOne(
        { user_id: userId },
        {
          $inc: { [Metric.RetweetCount]: 1 },
          $setOnInsert: {
            created_time: Date.now(),
          },
        },
        { upsert: true, session: session },
      );
    });
    if (result.duplicated) {
      return {
        verified: false,
        tip: 'The Twitter Account has already claimed reward.',
      };
    }
    await sendBadgeCheckMessages(userId, {
      [Metric.RetweetCount]: 1,
      [Metric.TwitterConnected]: 1,
    });
    return {
      verified: result.done,
      claimed_amount: result.done ? rewardDelta : undefined,
      tip: result.done ? `You have claimed ${rewardDelta} MB.` : 'Server Internal Error',
    };
  }
}
