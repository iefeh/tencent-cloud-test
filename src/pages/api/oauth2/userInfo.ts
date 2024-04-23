import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import * as response from "@/lib/response/response";
import { Request, Response } from 'oauth2-server'
import server from '../../../lib/oauth2/oauth2Server'
import {UserContextRequest} from "@/lib/middleware/auth";
import UserWallet from '../../../lib/models/UserWallet';
import { OAuth2Scopes } from '../../../lib/models/OAuth2Scopes';

const router = createRouter<UserContextRequest, NextApiResponse>();
router.get(async (req, res) => {
  // 用于提供通过访问令牌获取用户信息的接口
  try {
    server.authenticate(new Request(req), new Response(res), { scope: OAuth2Scopes.UserInfo })
    .then(
      async function(token: any) {
        const user = token.user;
        const user_wallet = await UserWallet.findOne({ user_id: user.user_id });
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
                web_token: user.particle.web_token,
                user_id: user.particle.user_id
            },
            wallet: wallet_addr
          }}));
      })
      .catch(
        function(error: any) {
          res.json(response.invalidParams({ message: error.message }));
        });
  }
  catch (error: any) {
    res.json(response.invalidParams({ message: error.message }));
  }
  return;
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