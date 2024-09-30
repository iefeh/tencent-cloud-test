import type {NextApiResponse} from "next";
import { createRouter } from 'next-connect';
import { v4 as uuidv4 } from 'uuid';

import { dynamicCors, UserContextRequest } from '@/lib/middleware/auth';
import GameProduct from '@/lib/models/GameProduct';
import GameProductPurchaseRequest from '@/lib/models/GameProductPurchaseRequest';
import { OAuth2Scopes } from '@/lib/models/OAuth2Scopes';
import { isDuplicateKeyError } from '@/lib/mongodb/client';
import { responseOnOauthError } from '@/lib/oauth2/response';
import OAuth2Server from '@/lib/oauth2/server';
import * as response from '@/lib/response/response';
import { Request, Response } from '@node-oauth/oauth2-server';

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(dynamicCors).post(async (req, res) => {
    try {
        const token = await OAuth2Server.authenticate(new Request(req), new Response(res), {scope: OAuth2Scopes.UserInfo});
        const userId = token.user.user_id;
        const gameId = token.client.id;

        const { product_id } = req.body;
        if (!product_id) {
            return res.json(response.invalidParams());
        }
        const gameProduct = await GameProduct.findOne({ id: product_id, game_id: gameId, active: true });
        if (!gameProduct) {
          return res.json(response.invalidParams({ message: "Invalid product id."}));
        }
        console.log(gameProduct);
        // 保存购买请求
        try {
            const now = Date.now();
            const productPurchaseRequest = new GameProductPurchaseRequest({
                request_id: uuidv4(),
                user_id: userId,
                game_id: gameId,
                token_id: "test",
                product_id: product_id,
                product_price_in_usd: gameProduct.price_in_usdc,
                request_time: now,
                payment_confirm_time: now
            });
            await productPurchaseRequest.save();
        }
        catch (error) {
            console.log(error);
            if (!isDuplicateKeyError(error)) {
                throw error;
            }
        }
        return res.json(response.success());
    } catch (error) {
        return responseOnOauthError(res, error);
    }
});

// this will run if none of the above matches
router.all((req, res) => {
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