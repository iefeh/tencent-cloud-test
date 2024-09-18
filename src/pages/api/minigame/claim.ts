import type { NextApiResponse } from "next";
import { createRouter } from 'next-connect';
import { mustAuthInterceptor, UserContextRequest } from '@/lib/middleware/auth';
import { errorInterceptor } from '@/lib/middleware/error';
import * as response from '@/lib/response/response';
import MiniGameDetail from "@/lib/models/MiniGameDetail";
import { redis } from "@/lib/redis/client";
import { queryUserTwitterAuthorization } from "@/lib/quests/implementations/connectTwitterQuest";
import { AuthorizationType } from "@/lib/authorization/types";
import GameTicket from "@/lib/models/GameTicket";
import { ethers } from "ethers";
import { twitterOAuthProvider } from "@/lib/authorization/provider/twitter";
import { isAxiosError } from "axios";
import logger from "@/lib/logger/winstonLogger";
import { deleteAuthToken } from "@/lib/authorization/provider/util";
import { constructVerifyResponse } from "@/lib/lottery/lottery";
import { ticketRemain } from "../oauth2/minigame/ticket/mine";

const router = createRouter<UserContextRequest, NextApiResponse>();
router.use(errorInterceptor(), mustAuthInterceptor).post(async (req, res) => {
  const { client_id } = req.body;
  if (!client_id) {
    res.json(response.invalidParams("Client id cannot be empty"));
    return;
  }

  const userId = req.userId!;
  const clientId = String(client_id);

  const lockKey = `claim-share-reward: ${clientId},${userId}`;
  const locked = await redis.set(lockKey, Date.now(), "EX", 10, "NX");
  if (!locked) {
    res.json(response.tooManyRequests());
    return;
  }

  const client = await MiniGameDetail.findOne({ client_id: clientId }, { share_reward: 1, _id: 0 });
  if (!client) {
    res.json(response.invalidParams("Incorrect client id."));
    return;
  }
  // 若不涉及分享得门票
  if (!client.share_reward.ticket_count || client.share_reward.ticket_count == 0) {
    res.json(response.success());
    return;
  }
  const claimed = await checkClaimed(userId, client.share_reward.round, clientId);
  if (claimed) {
    res.json(response.tooManyRequests("This account has already claimed the sharing reward."));
    return;
  }

  const result = await verifyShare(userId, client.share_reward);
  if (!result.verified) {
    return res.json(response.success(result));
  }

  await distributeTickets(userId, clientId, client);

  const ticketsCount = await ticketRemain(userId, clientId);

  return res.json(response.success({ verified: true, available_tickets: ticketsCount, reward_tickets: client.share_reward.ticket_count }));
});

export async function checkClaimed(userId: string, round: any, clientId: string) {
  const passId = ethers.id(`${userId},${clientId},share-reward,${round},0`);
  const tickets = await GameTicket.findOne({ pass_id: `SHARE-${passId}` });
  return !!tickets;
}

async function verifyShare(userId: string, shareReward: any) {
  const twitterAuth = await queryUserTwitterAuthorization(userId);
  if (!twitterAuth) {
    return { verified: false, require_authorization: AuthorizationType.Twitter };
  }
  const rateLimitedKey = `twitter_tweets:${twitterAuth.twitter_id}`;
  const rateLimited = await redis.get(rateLimitedKey);
  if (rateLimited) {
    logger.warn(`user ${twitterAuth.user_id} twitter ${twitterAuth.twitter_id} tweets limited by redis`);
    return constructVerifyResponse(false, "Network busy, please try again later.");
  }

  const twitterUrl = `https://api.twitter.com/2/users/${twitterAuth.twitter_id}/tweets?exclude=retweets&max_results=10&tweet.fields=text,entities`;
  const twitterRequest = twitterOAuthProvider.createRequest(twitterAuth.token);
  let verified = false;
  try {
    const data: any = await twitterRequest.get(twitterUrl);
    if (data.meta.result_count > 0) {
      for (let twitter of data.data) {
        let twitterText: string = twitter.text.replace(/(\r\n|\n|\r|\s)/gm, "");
        if (twitter.entities && twitter.entities.urls) {
          for (let url of twitter.entities.urls) {
            twitterText = twitterText.replace(url.url, url.unwound_url);
          }
        }
        verified = true;
        for (let kw of shareReward.tweet_kw) {
          if (!twitterText.includes(kw)) {
            verified = false;
            break;
          }
        }
        if (verified) {
          break;
        }
      }
    }

    return constructVerifyResponse(verified, verified ? "" : "No Twitter content detected. Please check your post and verify again after 1 minute.");
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

async function distributeTickets(userId: string, clientId: string, client: any) {
  // 缓存门票过期时间
  const cachedKey = `ticket-expiration:${clientId}`;
  let expiredAt: any = await redis.get(cachedKey);
  if (!expiredAt) {
    const expiration = await MiniGameDetail.findOne({ client_id: clientId }, { _id: 0, ticket_expired_at: 1 });
    if (expiration.ticket_expired_at) {
      expiredAt = expiration.ticket_expired_at;
    } else {
      // 若未配置门票过期时间，则给一个大值，保证门票不过期。
      expiredAt = 10 * Date.now();
    }
    await redis.setex(cachedKey, 60, expiredAt);
  }
  expiredAt = Number(expiredAt);

  let tickets: any[] = [];
  for (let i = 0; i < client.share_reward.ticket_count; i++) {
    const ticket = new GameTicket();
    ticket.pass_id = `SHARE-${ethers.id(`${userId},${clientId},share-reward,${client.share_reward.round},${i}`)}`;
    ticket.user_id = userId;
    ticket.game_id = clientId;
    ticket.created_at = Date.now();
    ticket.expired_at = expiredAt;
    tickets.push(ticket);
  }
  // 保存门票
  if (tickets.length > 0) {
    try {
      await GameTicket.insertMany(tickets);
    } catch (error: any) {
      if (error.code !== 11000) {
        logger.warn(error);
      }
    }
  }

  return client.share_reward.ticket_count;
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