import type {NextApiResponse} from "next";
import { createRouter } from 'next-connect';

import { UserContextRequest } from '@/lib/middleware/auth';
import { errorInterceptor } from '@/lib/middleware/error';
import OAuth2ExchangeCode from '@/lib/models/OAuth2ExchangeCode';
import OAuth2Token from '@/lib/models/OAuth2Token';
import * as response from '@/lib/response/response';

const router = createRouter<UserContextRequest, NextApiResponse>();
router.use(errorInterceptor()).post(async (req, res) => {
    const { authorization_code } = req.body;
    const code = await OAuth2ExchangeCode.findOne({ authorization_code: authorization_code, expires_at: { $gt: Date.now()}});
    if (!code) {
        return res.json(response.authorizationCodeExpired());
    }
    const token = await OAuth2Token.findOne({ user_id: code.user_id, client_id: code.client_id, access_token_expires_at: { $gt: Date.now() }});
    await OAuth2ExchangeCode.deleteOne({ authorization_code: authorization_code });
    if (!token) {
        return res.json(response.authorizationCodeExpired());
    }
    return res.json(response.success({
        access_token: token.access_token,
        expires_at: token.access_token_expires_at,
    }));
});

// this will run if none of the above matches
router.all((req, res) => {
  if (req.method === 'OPTIONS') {
    return res.status(204).end(); // 预检请求返回 204，避免 GET 触发错误
  }
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