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
    const userPurchases = await getUserPurchaseSummary(userId, gameId);
    let totalCost = 0;
    let confirmedPurchaseCount = 0;
    let pendingPurchaseCount = 0;
    for (let purchase of userPurchases) {
      totalCost += purchase.totalPaymentInUSDC;
      if (purchase.isTXConfirmed) {
        confirmedPurchaseCount = purchase.count;
      } else {
        pendingPurchaseCount = purchase.count;
      }
    }
    res.json(response.success(
      {
        total_cost_in_usdc: totalCost,
        confirmed_purchase_count: confirmedPurchaseCount,
        pending_purchase_count: pendingPurchaseCount,
      }
    ));
  } catch (error: any) {
    return responseOnOauthError(res, error);
  }
});

async function getUserPurchaseSummary(userId: string, gameId: string) {
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
          __v: 0,
          game_id: 0,
          },
      },
      {
          $group: {
              _id: "$payment_notification_sent",
              count: { $sum: 1 },
              totalPaymentInUSDC: { $sum: "$product_price_in_usd" }
          }
      },
      {
          $project: { _id: 0, isTXConfirmed: '$_id', count: 1, totalPaymentInUSDC: 1 }
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