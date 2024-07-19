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
router.use(dynamicCors).get(async (req, res) => {
    try {
        const token = await OAuth2Server.authenticate(new Request(req), new Response(res), { scope: OAuth2Scopes.UserInfo })
        const userId = token.user.user_id;
        const user = await User.findOne({ user_id: userId });
        if (!user) {
          return res.json(response.invalidParams("Cannot find the user."));
        }
        const selfDesctructRequestTime = user.selfdestruct_request_time;
        const selfDestructFinishTime = selfDesctructRequestTime? selfDesctructRequestTime + 1000 * 60 * 60 * 24 * 90 : null;
        return res.json(response.success({
          destruct_request_submitted: selfDesctructRequestTime? true : false,
          selfdestruct_request_time: selfDesctructRequestTime? selfDesctructRequestTime : null,
          selfdestruct_finish_time: selfDestructFinishTime
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