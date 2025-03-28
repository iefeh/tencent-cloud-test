
import type { NextApiResponse } from "next";
import { createRouter } from "next-connect";
import * as response from "@/lib/response/response";
import { UserContextRequest, dynamicCors } from "@/lib/middleware/auth";
import { responseOnOauthError } from "@/lib/oauth2/response";
import { OAuth2Scopes } from '@/lib/models/OAuth2Scopes';
import OAuth2Server from '@/lib/oauth2/server';
import { Request, Response } from '@node-oauth/oauth2-server';
import { createRewardNotification } from "@/pages/api/games/astrark/share";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(dynamicCors).get(async (req, res) => {
    try {
        const token = await OAuth2Server.authenticate(new Request(req), new Response(res), { scope: OAuth2Scopes.UserInfo });
        const userId = token.user.user_id;
        await createRewardNotification(userId);
        res.json(response.success());
    } catch (error: any) {
        return responseOnOauthError(res, error);
    }
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

export default router.handler({
    onError(err, req, res) {
        console.error(err);
        res.status(500).json(response.serverError());
    },
});