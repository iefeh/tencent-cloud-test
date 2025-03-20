import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import connectToMongoDbDev from "@/lib/mongodb/client";
import * as response from "@/lib/response/response";
import {mustAuthInterceptor, UserContextRequest} from "@/lib/middleware/auth";
import logger from "@/lib/logger/winstonLogger";
import {constructQuest} from "@/lib/quests/constructor";
import {redis} from "@/lib/redis/client";
import * as Sentry from "@sentry/nextjs";
import {errorInterceptor} from "@/lib/middleware/error";
import {timeoutInterceptor} from "@/lib/middleware/timeout";
import Campaign from "@/lib/models/Campaign";
import QuestAchievement from "@/lib/models/QuestAchievement";
import CampaignAchievement from "@/lib/models/CampaignAchievement";
import {queryUserTwitterAuthorization} from "@/lib/quests/implementations/connectTwitterQuest";
import {AuthorizationType} from "@/lib/authorization/types";
import {twitterOAuthProvider} from "@/lib/authorization/provider/twitter";

const router = createRouter<UserContextRequest, NextApiResponse>();


const defaultErrorResponse = response.success({
    verified: false,
    tip: "Network busy, please try again later.",
})

router.use(errorInterceptor(defaultErrorResponse), mustAuthInterceptor, timeoutInterceptor(defaultErrorResponse, 15000)).post(async (req, res) => {
    // const {username} = req.body;
    // if (!username) {
    //     return res.json(response.invalidParams());
    // }
    const userId = req.userId!;
    const twitterAuth = await queryUserTwitterAuthorization(userId);
    if (!twitterAuth) {
        return res.json(response.success({
            followed: false,
            require_authorization: AuthorizationType.Twitter,
        }));
    }
    const twitterRequest = twitterOAuthProvider.createRequest(twitterAuth.token);
    const data: any = await twitterRequest.post(`https://api.twitter.com/2/users/${twitterAuth.twitter_id}/likes`, {
        tweet_id: "1758743739814625636",
    });
    // { data: { liked: true } }，重复点赞不会报错，依然返回该结果
    console.log(data);
    // 检查用户是否已经完成所有任务
    return res.json(response.success({
        verified: true,
    }));
});

// this will run if none of the above matches
router.all((req, res) => {
  if (req.method === 'OPTIONS') {
    return res.status(204).end(); // 预检请求返回 204，避免 GET 触发错误
  }
    res.status(405).json({
        error: "Method not allowed",
    });
});

export default router.handler();