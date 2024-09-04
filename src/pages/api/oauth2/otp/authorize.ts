import type {NextApiResponse} from "next";
import { createRouter } from 'next-connect';
import { v4 as uuidV4 } from 'uuid';

import { UserContextRequest, dynamicCors } from "@/lib/middleware/auth";
import OAuth2GameCode from '@/lib/models/OAuth2GameCode';
import { OAuth2Scopes } from '@/lib/models/OAuth2Scopes';
import { responseOnOauthError } from '@/lib/oauth2/response';
import OAuth2Server from '@/lib/oauth2/server';
import { redis } from '@/lib/redis/client';
import * as response from '@/lib/response/response';
import { Request, Response } from '@node-oauth/oauth2-server';

const router = createRouter<UserContextRequest, NextApiResponse>();
router.use(dynamicCors).post(async (req, res) => {
    try {
        const token = await OAuth2Server.authenticate(new Request(req), new Response(res), { scope: OAuth2Scopes.UserInfo });
        const userId = token.user.user_id;
        const lockKey = `gameToken,${userId}`;
        const locked = await redis.set(lockKey, Date.now(), "EX", 10, "NX");
        if (!locked) {
            return res.json(response.tooManyRequests());
        }
        await OAuth2GameCode.deleteOne({ user_id: userId, client_id: token.client.id });
        const gameToken = new OAuth2GameCode({
            user_id: userId,
            client_id: token.client.id,
            authorization_code: uuidV4(),
            expires_at: Date.now() + 24 * 60 * 60 * 1000,
        });
        await gameToken.save();
        res.json(response.success({
            authorization_code: gameToken.authorization_code,
            expires_at: gameToken.expires_at
        }));
    } catch (error: any) {
        return responseOnOauthError(res, error);
    }
});

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