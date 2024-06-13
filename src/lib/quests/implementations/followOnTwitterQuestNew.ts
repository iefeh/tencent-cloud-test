import { IQuest } from '@/lib/models/Quest';
import { FollowOnTwitter, checkClaimableResult, claimRewardResult } from '@/lib/quests/types';
import UserTwitter from '@/lib/models/UserTwitter';
import { AuthorizationType } from '@/lib/authorization/types';
import { QuestBase } from './base';
import UserMetrics, { Metric } from '@/lib/models/UserMetrics';
import { sendBadgeCheckMessages } from '@/lib/kafka/client';
import { ClientSession } from 'mongoose';
import { queryUserTwitterAuthorization } from "@/lib/quests/implementations/connectTwitterQuest";
import { redis } from "@/lib/redis/client";
import logger from "@/lib/logger/winstonLogger";
import { twitterOAuthProvider } from "@/lib/authorization/provider/twitter";
import { isAxiosError } from "axios";
import { deleteAuthToken } from "@/lib/authorization/provider/util";
import userinfo from '@/pages/api/oauth2/userinfo';

export class FollowOnTwitterQuest extends QuestBase {
  // 定义twitter账号与指标的映射关系
  private readonly followMetrics = new Map<string, Metric>([
    [process.env.MOONVEIL_TWITTER_USERNAME!, Metric.TwitterFollowedMoonveil],
    [process.env.ASTRARK_TWITTER_USERNAME!, Metric.TwitterFollowedAstrArk],
  ]);

  constructor(quest: IQuest) {
    super(quest);
  }

  async checkClaimable(userId: string): Promise<checkClaimableResult> {
    // 要求用户绑定了twitter账号且目前授权token有效
    const twitterAuth = await queryUserTwitterAuthorization(userId);
    if (!twitterAuth) {
      return {
        claimable: false,
        require_authorization: AuthorizationType.Twitter,
      }
    }

    // 检查是否限流
    const rateLimitedKey = `follow_twitter:${twitterAuth.twitter_id}`;
    const rateLimited = await redis.get(rateLimitedKey);
    if (rateLimited) {
      logger.warn(`user ${userId} twitter ${twitterAuth.twitter_id} follow twitter limited by redis`);
      return {
        claimable: false,
        tip: "Network busy, please try again later."
      }
    }

    // 拼接请求URL
    const twitterRequest = twitterOAuthProvider.createRequest(twitterAuth.token);
    const queryFollowerURL = `https://api.twitter.com/2/users/${twitterAuth.twitter_id}/following`;

    const questProp = this.quest.properties as FollowOnTwitter;
    try {

      // 直接发送关注用户的请求
      const data: any = await twitterRequest.post(queryFollowerURL, { target_user_id: questProp.target_twitter_id });console.log(data);

      // 校验结果
      const claimable: boolean = data.data.following;
      return {
        claimable: claimable,
        extra: twitterAuth.twitter_id,
        tip: claimable ? undefined : "Unable to follow user. Please check your settings or try again later.",
      }
    } catch (error) {
      if (!isAxiosError(error)) {
        throw error;
      }

      const response = error.response!;
      // 当前无权限，移除用户的授权token
      if (response.status === 403 || response.data.error_description == "Value passed for the token was invalid.") {
        logger.warn(`user ${userId} twitter ${twitterAuth.twitter_id} like invalidated: ${JSON.stringify(response.data)}`);
        await deleteAuthToken(twitterAuth.token);
        return {
          claimable: false,
          require_authorization: AuthorizationType.Twitter,
          tip: "You should connect your Twitter Account first."
        }
      }
      // 当前是否已经被限流，需要添加限流处理
      if (response.status === 429) {
        logger.warn(`user ${userId} twitter ${twitterAuth.twitter_id} like rate limited: ${JSON.stringify(response.data)}`);
        const resetAt = response.headers["x-rate-limit-reset"];
        if (resetAt) {
          const wait = Number(resetAt) - Math.ceil(Date.now() / 1000);
          if (wait) {
            await redis.setex(rateLimitedKey, wait, 1);
          }
        }
        return {
          claimable: false,
          tip: "Network busy, please try again later."
        }
      }
      throw error;
    }
  }

  private checkUserMetric(userId: string): undefined | ((session: ClientSession) => Promise<void>) {
    const questProp = this.quest.properties as FollowOnTwitter;
    const followMetric = this.followMetrics.get(questProp.username);
    let updateMetric = undefined;
    if (followMetric) {
      updateMetric = async (session: any) => {
        await UserMetrics.updateOne(
          { user_id: userId },
          {
            $set: {
              [followMetric]: 1,
              [Metric.TwitterConnected]: 1,
            },
            $setOnInsert: {
              created_time: Date.now(),
            },
          },
          { upsert: true, session: session },
        );
      };
    }
    return updateMetric;
  }

  private async sendBadgeCheckMessage(userId: string) {
    const questProp = this.quest.properties as FollowOnTwitter;
    const followMetric = this.followMetrics.get(questProp.username);
    if (followMetric) {
      await sendBadgeCheckMessages(userId, {
        [followMetric]: 1,
        [Metric.TwitterConnected]: 1,
      });
    }
  }

  async claimReward(userId: string): Promise<claimRewardResult> {
    const claim = await this.checkClaimable(userId);
    if (!claim.claimable) {
      return {
        verified: false,
        tip: 'Please click follow to complete task first.',
      };
    }
    // 检查是否触发关注指标
    const updateMetric = this.checkUserMetric(userId);

    // 污染twitter，确保同一个twitter单任务只能获取一次奖励
    const taint = `${this.quest.id},${AuthorizationType.Twitter},${claim.extra}`;
    const rewardDelta = await this.checkUserRewardDelta(userId);
    const result = await this.saveUserReward(userId, taint, rewardDelta, null, updateMetric);
    if (result.duplicated) {
      return {
        verified: false,
        tip: 'The Twitter Account has already claimed reward.',
      };
    }
    // 检查当前满足的指标并发送消息
    await this.sendBadgeCheckMessage(userId);
    return {
      verified: result.done,
      claimed_amount: result.done ? rewardDelta : undefined,
      tip: result.done ? `You have claimed ${rewardDelta} MB.` : 'Server Internal Error',
    };
  }
}
