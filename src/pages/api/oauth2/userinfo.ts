import type {NextApiResponse} from "next";
import { createRouter } from 'next-connect';

import logger from '@/lib/logger/winstonLogger';
import { dynamicCors, UserContextRequest } from '@/lib/middleware/auth';
import { OAuth2Scopes } from '@/lib/models/OAuth2Scopes';
import UserWallet from '@/lib/models/UserWallet';
import { responseOnOauthError } from '@/lib/oauth2/response';
import OAuth2Server from '@/lib/oauth2/server';
import * as response from '@/lib/response/response';
import { Request, Response } from '@node-oauth/oauth2-server';

const router = createRouter<UserContextRequest, NextApiResponse>();
router.use(dynamicCors).get(async (req, res) => {
    // 用于提供通过访问令牌获取用户信息的接口
    try {
        const token = await OAuth2Server.authenticate(new Request(req), new Response(res), {scope: OAuth2Scopes.UserInfo})
        const user = token.user;
        const user_wallet = await UserWallet.findOne({user_id: user.user_id});
        let wallet_addr = "";
        if (user_wallet) {
            wallet_addr = user_wallet.wallet_addr;
        }
        res.json(response.success({
            user: {
                user_id: user.user_id,
                username: user.username,
                email: user.email,
                avatar_url: user.avatar_url,
                particle: {
                    evm_wallet: user.particle.evm_wallet,
                    // 暂不返回，后续磋商
                    web_token: user.particle.web_token,
                    user_id: user.particle.user_id
                },
                wallet: wallet_addr
            }
        }));
    } catch (error: any) {
        logger.info(`[oauth2/userinfo] request authorization header ${req.headers.authorization}`);
        return responseOnOauthError(res, error);
    }
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