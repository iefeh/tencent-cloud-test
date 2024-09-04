import type {NextApiResponse} from "next";
import { createRouter } from 'next-connect';

import { UserContextRequest } from '@/lib/middleware/auth';
import { errorInterceptor } from '@/lib/middleware/error';
import OAuth2GameCode from '@/lib/models/OAuth2GameCode';
import OAuth2Token from '@/lib/models/OAuth2Token';
import * as response from '@/lib/response/response';

const router = createRouter<UserContextRequest, NextApiResponse>();
router.use(errorInterceptor()).post(async (req, res) => {
    const { authorization_code } = req.body;
    const code = await OAuth2GameCode.findOne({ authorization_code: authorization_code, expires_at: { $gt: Date.now()}});
    if (!code) {
        return res.json(response.unauthorized());
    }
    const token = await OAuth2Token.findOne({ user_id: code.user_id, client_id: code.client_id, access_token_expires_at: { $gt: Date.now() }});
    await OAuth2GameCode.deleteOne({ authorization_code: authorization_code });
    if (!token) {
        return res.json(response.unauthorized());
    }
    return res.json(response.success({
        access_token: token.access_token,
        expires_at: token.access_token_expires_at,
    }));
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