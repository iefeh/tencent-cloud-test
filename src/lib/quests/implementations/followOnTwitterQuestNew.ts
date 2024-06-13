import { IQuest } from '@/lib/models/Quest';
import { FollowOnTwitter, checkClaimableResult } from '@/lib/quests/types';
import { AuthorizationType } from '@/lib/authorization/types';
import { queryUserTwitterAuthorization } from "@/lib/quests/implementations/connectTwitterQuest";
import { redis } from "@/lib/redis/client";
import logger from "@/lib/logger/winstonLogger";
import { twitterOAuthProvider } from "@/lib/authorization/provider/twitter";
import { isAxiosError } from "axios";
import { deleteAuthToken } from "@/lib/authorization/provider/util";
import { FollowOnTwitterQuest } from './followOnTwitterQuest';

export class FollowOnTwitterQuestNew extends FollowOnTwitterQuest {

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
      const data: any = await twitterRequest.post(queryFollowerURL, { target_user_id: questProp.target_twitter_id }); console.log(data);

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
}