import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import * as response from "@/lib/response/response";
import {mustAuthInterceptor, UserContextRequest} from "@/lib/middleware/auth";
import OAuth2Token from "@/lib/models/OAuth2Token";
import {errorInterceptor} from '@/lib/middleware/error';

const router = createRouter<UserContextRequest, NextApiResponse>();
router.use(errorInterceptor(), mustAuthInterceptor).post(async (req, res) => {
    const token = await OAuth2Token.findOne({client_id: req.body.client_id, user_id: req.userId});
    if (token) {
        token.access_token_expires_at = Date.now() - 1000;
        await token.save();
    }
    res.json(response.success());
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