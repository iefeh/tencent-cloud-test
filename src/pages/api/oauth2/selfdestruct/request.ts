import type { NextApiResponse } from "next";
import { createRouter } from 'next-connect';

import { dynamicCors, UserContextRequest } from '@/lib/middleware/auth';
import { OAuth2Scopes } from '@/lib/models/OAuth2Scopes';
import User from '@/lib/models/User';
import { responseOnOauthError } from '@/lib/oauth2/response';
import OAuth2Server from '@/lib/oauth2/server';
import * as response from '@/lib/response/response';
import { Request, Response } from '@node-oauth/oauth2-server';

const router = createRouter<UserContextRequest, NextApiResponse>();
router.use(dynamicCors).post(async (req, res) => {
    try {
        const token = await OAuth2Server.authenticate(new Request(req), new Response(res), { scope: OAuth2Scopes.UserInfo })
        const userId = token.user.user_id;
        const user = await User.findOne({ user_id: userId, selfdestruct_request_time: null });
        if (!user) {
          return res.json(response.invalidParams({ result: false, message: "Cannot find the user or the user already submitted a self destruct request request."}));
        }
        await User.updateOne({ user_id: userId }, { selfdestruct_request_time: Date.now() })
        return res.json(response.success({ result: true }));

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