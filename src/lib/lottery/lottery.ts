import { isAxiosError } from 'axios';

import { twitterOAuthProvider } from '@/lib/authorization/provider/twitter';
import { deleteAuthToken } from '@/lib/authorization/provider/util';
import { AuthorizationType } from '@/lib/authorization/types';
import { isPremiumSatisfied } from '@/lib/battlepass/battlepass';
import logger from '@/lib/logger/winstonLogger';
import LotteryPool, { ILotteryPool, LotteryTwitterTopic } from '@/lib/models/LotteryPool';
import User from '@/lib/models/User';
import UserLotteryPool, { IUserLotteryPool } from '@/lib/models/UserLotteryPool';
import UserMoonBeamAudit, { UserMoonBeamAuditType } from '@/lib/models/UserMoonBeamAudit';
import { queryUserTwitterAuthorization } from '@/lib/quests/implementations/connectTwitterQuest';
import { redis } from '@/lib/redis/client';

export async function getLotteryPoolById(lotteryPoolId: string): Promise<ILotteryPool | null> {
  const now = Date.now()
  const lotteryPool = await LotteryPool.findOne({ lottery_pool_id: lotteryPoolId, deleted_time: null, start_time: { $lte: now }, end_time: { $gte: now }});
  return lotteryPool;
}

export async function canClaimPremiumBenifits(userId: string, lotteryPoolId: string): Promise<boolean> {
  const isPremium = await isPremiumSatisfied(userId); 
  const userLotteryPool = await UserLotteryPool.findOne({ user_id: userId, lottery_pool_id: lotteryPoolId, deleted_time: null });
  return isPremium && (!userLotteryPool || !userLotteryPool.premium_benifits_claimed);
}

export function constructVerifyResponse(verified: boolean, message: string, requireAuthorization?: boolean) {
  return { verified: verified, message: message, require_authorization: requireAuthorization? AuthorizationType.Twitter : undefined };
}

export async function verifyTwitterTopic(userId: string, lotteryPoolId: string, maxRewardClaimType: number): Promise<any> {
  const lotteryPool = await getLotteryPoolById(lotteryPoolId) as ILotteryPool;
  if (!lotteryPool) {
    return constructVerifyResponse(false, "The lottery pool is not opened or has been closed.");
  }
  const twitterAuth = await queryUserTwitterAuthorization(userId);
  if (!twitterAuth) {
    return constructVerifyResponse(false, "You should connect your Twitter Account first.", true);
  }
  const rateLimitedKey = `twitter_tweets:${twitterAuth.twitter_id}`;
  const rateLimited = await redis.get(rateLimitedKey);
  if (rateLimited) {
    logger.warn(`user ${twitterAuth.user_id} twitter ${twitterAuth.twitter_id} tweets limited by redis`);
    return constructVerifyResponse(false, "Network busy, please try again later.");
  }
  const twitterUrl = `https://api.twitter.com/2/users/${twitterAuth.twitter_id}/tweets?exclude=retweets&max_results=10&tweet.fields=text,entities`;
  const twitterRequest = twitterOAuthProvider.createRequest(twitterAuth.token);
  try {
    const data: any = await twitterRequest.get(twitterUrl);
    let verified = false;
    if (data.meta.result_count > 0) {
      let urlText = "";
      const twitterTopic = lotteryPool.twitter_topics.find(topics => (topics.reward_claim_type === maxRewardClaimType)) as LotteryTwitterTopic;
      if (twitterTopic.twitter_topic_urls && twitterTopic.twitter_topic_urls.length > 0) {
        urlText = twitterTopic.twitter_topic_urls.join(",");
      }
      // 把奖池的hashtag转换成推文的格式
      let hashtagsText = "";
      if (twitterTopic.twitter_topic_hashtags && twitterTopic.twitter_topic_hashtags.length > 0) {
        hashtagsText = "#" + twitterTopic.twitter_topic_hashtags.join("#");
      }
      // 拼接整体推文, 格式是{text} + {url} + {hashtags}
      const mustHaveText = `${twitterTopic.twitter_topic_text}${urlText}${hashtagsText}`.replace(/(\r\n|\n|\r|\s)/gm, "");
      for(let twitter of data.data) {
        let twitterText: string = twitter.text.replace(/(\r\n|\n|\r|\s)/gm, "");
        if (twitter.entities && twitter.entities.urls) {
          for (let url of twitter.entities.urls) {
            twitterText = twitterText.replace(url.url, url.unwound_url);
          }
        }
        if (twitterText.includes(mustHaveText)) {
          verified = true;
          break;
        }
      }
    }
    return constructVerifyResponse(verified, verified? "" : "No Twitter content detected. Please check your post and verify again after 1 minute.");
  } catch (error) {
    if (!isAxiosError(error)) {
      throw error;
    }
    // 检查响应
    const response = error.response!;
    // 当前无权限，移除用户的授权token
    if (response.status === 403 || response.data.error_description == "Value passed for the token was invalid.") {
      logger.warn(`user ${userId} twitter ${twitterAuth.twitter_id} tweets invalidated: ${JSON.stringify(response.data)}`);
      await deleteAuthToken(twitterAuth.token);
      return constructVerifyResponse(false, "You should connect your Twitter Account first.", true);
    }
    // 当前是否已经被限流，需要添加限流处理
    if (response.status === 429) {
      logger.warn(`user ${userId} twitter ${twitterAuth.twitter_id} tweets rate limited: ${JSON.stringify(response.data)}`);
      const resetAt = response.headers["x-rate-limit-reset"];
      if (resetAt) {
        const wait = Number(resetAt) - Math.ceil(Date.now() / 1000);
        if (wait) {
            await redis.setex(rateLimitedKey, wait, 1);
        }
      }
      return constructVerifyResponse(false, "Network busy, please try again later.");
    }
    throw error;
  }
}

export async function verifyLotteryQualification(lotteryPoolId: string, drawCount: number, lotteryTicketCost: number, mbCost: number, userId: string): Promise<{ verified: boolean, message: string }> {
  const lockKey = `claim_draw_lock:${lotteryPoolId}:${userId}`;
  // 锁定用户抽奖资源10秒
  let interval: number = 10;
  const locked = await redis.set(lockKey, Date.now(), "EX", interval, "NX");
  if (!locked) {
    return {
      verified: false,
      message: `You may perform a lottery draw per ${interval}s, please try again later.`,
    };
  }
  const user = await User.findOne({ user_id: userId });
  const lotteryPool = await getLotteryPoolById(lotteryPoolId) as ILotteryPool;
  if (!lotteryPool) {
    return {
      verified: false,
      message: "The lottery pool is not opened or has been closed."
    };
  }
  const userLotteryPool = await UserLotteryPool.findOne({ user_id: userId, lottery_pool_id: lotteryPoolId, deleted_time: null });
  const userS1LotteryTicketAmount = user.lottery_ticket_amount;
  const userMbAmount = user.moon_beam;
  const userAvailableDrawCount = lotteryPool.draw_limits? lotteryPool.draw_limits - (userLotteryPool ? userLotteryPool.draw_amount : 0) : 1000;
  // 验证用户是否还有可用的抽奖次数
  if (userAvailableDrawCount < drawCount) {
    return {
      verified: false,
      message: `In this pool you have ${userAvailableDrawCount} draw times left however you choose to draw ${drawCount} times.`
    }
  }
  // 验证用户本次抽奖需要消耗的资源, 默认先消耗当前奖池的免费抽奖券, 然后是其他资源, 如果资源不足或者与当前抽奖次数不匹配则返回错误信息
  if (mbCost%25 !== 0 || mbCost > userMbAmount) {
    return {
      verified: false,
      message: "Invalid moon beam cost. The moon beam cost should be mutiples of 25 or you don't have enough moon beams."
    };
  }
  if (userS1LotteryTicketAmount < lotteryTicketCost) {
    return {
      verified: false,
      message: `Invalid resource cost, you choose to use ${lotteryTicketCost} S1 tickets, however you have only ${userS1LotteryTicketAmount} S1 tickets.`
    };
  }
  let availableResourceDrawCount = 0;
  if (userLotteryPool) {
    if (userLotteryPool.free_lottery_ticket_amount >= drawCount) {
      availableResourceDrawCount = drawCount;
    }
    else {
      availableResourceDrawCount = userLotteryPool.free_lottery_ticket_amount;
    }
  }
  availableResourceDrawCount += lotteryTicketCost + mbCost/25;
  if (availableResourceDrawCount > drawCount) {
    return {
      verified: false,
      message: `Invalid resource cost, you are going to draw ${drawCount} times, however the resource you choose can draw ${availableResourceDrawCount} times.`
    };
  }
  else if (availableResourceDrawCount < drawCount) {
    return {
      verified: false,
      message: `No enough resource, you are going to draw ${drawCount} times, however the resource you choose can draw ${availableResourceDrawCount} times.`
    }
  }
  return {
    verified: true,
    message: ""
  };
}

export function constructMoonBeamAudit(userId: string, lotteryPoolId: string, rewardId: string, moonBeamAmount: number, drawTimes?: number) {
  let audit = new UserMoonBeamAudit({
    user_id: userId,
    type: UserMoonBeamAuditType.LuckyDraw,
    moon_beam_delta: moonBeamAmount,
    reward_taint: `lottery_pool_id:${lotteryPoolId},reward_id:${rewardId},user:${userId}`,
    corr_id: rewardId,
    extra_info: drawTimes? String(drawTimes) : null,
    created_time: Date.now(),
  });
  return audit;
}