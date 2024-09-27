import type {NextApiResponse} from "next";
import { PipelineStage } from 'mongoose';
import { createRouter } from 'next-connect';

import { dynamicCors, UserContextRequest } from '@/lib/middleware/auth';
import GameProductPurchaseRequest from '@/lib/models/GameProductPurchaseRequest';
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
        const userId = token.user.user_id;
        if (!gameId) {
            return res.json(response.serverError());
        }
        const userPurchases = await getUserPurchaseList(userId, gameId);
        for (let purchase of userPurchases) {
            let digits = Number(purchase.payment_token_amount.substring(0, purchase.payment_token_amount.length - purchase.token.decimal + 6))/(10**6);
            purchase.token_amount_formatted = digits;
            purchase.payment_confirmed = purchase.payment_confirm_time ? true: false;
            delete purchase.token_id;
            delete purchase.product_id;
            delete purchase.payment_confirm_time;
        }
        res.json(response.success(userPurchases));
    } catch (error: any) {
        return responseOnOauthError(res, error);
    }
});

async function getUserPurchaseList(userId: string, gameId: string) {
    let matchOpt: any = {
        $match: {
            game_id: gameId,
            user_id: userId,
            payment_tx_hash: { $gt: "" },
        }
    }; 
    const aggregateQuery: PipelineStage[] = [
        matchOpt,
        {
            $project: { 
                _id: 0,
                product_id: 1,
                token_id: 1,
                request_time: 1,
                product_price_in_usd: 1,
                payment_token_amount: 1,
                payment_confirm_time: 1
            }
        },
        {
            $lookup: {
                from: 'game_products',
                localField: 'product_id',
                foreignField: 'id',
                as: 'product',
                pipeline: [
                    {
                        $project: {
                            _id: 0,
                            name: 1
                        },
                    },
                ],
            }
        },
        {
            $unwind: '$product'
        },
        {
            $lookup: {
                from: 'game_product_tokens',
                localField: 'token_id',
                foreignField: 'id',
                as: 'token',
                pipeline: [
                    {
                        $project: {
                            _id: 0,
                            icon_url: 1,
                            symbol: 1,
                            decimal: 1
                        },
                    },
                ],
            }
        },
        {
            $unwind: '$token'
        }
    ];
    const results = await GameProductPurchaseRequest.aggregate(aggregateQuery);
    return results;
}


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