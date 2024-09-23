import type {NextApiResponse} from "next";
import { createRouter } from 'next-connect';

import { dynamicCors, UserContextRequest } from '@/lib/middleware/auth';
import { getGameProduct } from '@/lib/models/GameProduct';
import { getGameTokens } from '@/lib/models/GameProductToken';
import { OAuth2Scopes } from '@/lib/models/OAuth2Scopes';
import { responseOnOauthError } from '@/lib/oauth2/response';
import OAuth2Server from '@/lib/oauth2/server';
import * as response from '@/lib/response/response';
import { Request, Response } from '@node-oauth/oauth2-server';

const router = createRouter<UserContextRequest, NextApiResponse>();
router.use(dynamicCors).get(async (req, res) => {
  try {
    const token = await OAuth2Server.authenticate(new Request(req), new Response(res), { scope: OAuth2Scopes.UserInfo });
    const gameId = token.client.id;
    if (!gameId) {
      return res.json(response.serverError());
    }
    const { item_id } = req.query;
    if (!item_id) {
      return res.json(response.invalidParams());
    }
    let gameProduct = await getGameProduct(gameId, item_id as string);
    if (!gameProduct) {
      return res.json(response.invalidParams({ message: "Invalid item id." }));
    }
    const tokens = await getGameTokens();
    const pow = 10 ** 6; //显示保留6位小数
    gameProduct.price_in_tokens = [];
    gameProduct.price_updated_at = tokens[0].price_updated_at;
    for (let token of tokens) {
      let price = gameProduct.price_in_usdc/token.price_in_usdc;
      gameProduct.price_in_tokens.push({
        token_id: token.id,
        token_name: token.name,
        icon_url: token.icon_url,
        symbol: token.symbol,
        address: token.address,
        network: {
          chain_id: token.chain_id,
          name: token.block_chain.name,
          icon_url: token.block_chain.icon_url,
        },
        product_price_discount: token.product_discount,
        product_token_price_with_discount: Math.ceil(price*(1-token.product_discount)*pow)/pow,
        product_usdc_price_with_discount: Math.ceil(gameProduct.price_in_usdc*(1-token.product_discount)*pow)/pow,
      });
    }
    res.json(response.success(gameProduct));
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