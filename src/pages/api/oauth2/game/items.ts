import type {NextApiResponse} from "next";
import { PipelineStage } from 'mongoose';
import { createRouter } from 'next-connect';

import { getISOFullDateTime, getISOMonthDayTime, getISOYearWeekString } from '@/lib/common/utils';
import { dynamicCors, UserContextRequest } from '@/lib/middleware/auth';
import GameProduct, { ProductLimitType } from '@/lib/models/GameProduct';
import GameProductClassification from '@/lib/models/GameProductClassification';
import GameProductPurchase from '@/lib/models/GameProductPurchase';
import { OAuth2Scopes } from '@/lib/models/OAuth2Scopes';
import { responseOnOauthError } from '@/lib/oauth2/response';
import OAuth2Server from '@/lib/oauth2/server';
import * as response from '@/lib/response/response';
import { Request, Response } from '@node-oauth/oauth2-server';

const router = createRouter<UserContextRequest, NextApiResponse>();
router.use(dynamicCors).get(async (req, res) => {
  try {
    const token = await OAuth2Server.authenticate(new Request(req), new Response(res), { scope: OAuth2Scopes.UserInfo });
    const userId = token.user.user_id;
    const gameId = token.client.id;
    if (!gameId) {
      return res.json(response.invalidParams());
    }
    const productClasses = await getProductClasses(gameId as string);
    if (!productClasses) {
      return res.json(response.invalidParams());
    }
    let productTypeMap = new Map<string, any[]>();
    productClasses.forEach(productClass => {
      for (let productType of productClass.product_types) {
        productTypeMap.set(productType.id, []);
      }
    });
    const gameProducts = await getGameProducts(gameId as string);
    let productMap = new Map<string, any>();
    gameProducts.forEach(gameProduct => {
      productMap.set(gameProduct.id, gameProduct);
    })
    const gamePurchase = await getProductPurchase(gameId as string, userId);
    const currentWeek = getISOYearWeekString(new Date());
    const currentMonthDay = getISOMonthDayTime(new Date());
    const currentDate = getISOFullDateTime(new Date());
    gamePurchase.forEach(purchase => {
      const product = productMap.get(purchase.product_id);
      // 根据产品限量周期和购买周期计算已售出数量
      if (product) {
        if (product.limit.type === ProductLimitType.Daily && purchase.period === currentDate ||
          product.limit.type === ProductLimitType.Weekly && purchase.period === currentWeek ||
          product.limit.type === ProductLimitType.Monthly && purchase.period === currentMonthDay
        ) {
          product.limit.sold_amount = purchase.count;
        }
      }
    });
    gameProducts.forEach(gameProduct => {
      // 判断当前周期内产品是否已经售空
      if (gameProduct.sold_amount >= gameProduct.limit.amount) {
        gameProduct.sold_out = true;
      } else {
        gameProduct.sold_out = false;
      }
      // 删除多余字段, 前端不需要展示
      delete gameProduct.limit.type;
      const targetArr = productTypeMap.get(gameProduct.product_type_id);
      if (targetArr) {
        delete gameProduct.product_type_id;
        targetArr.push(gameProduct);
      }
    });
    productClasses.forEach(productClass => {
      for (let productType of productClass.product_types) {
        productType.products = productTypeMap.get(productType.id);
        delete productType.id;
      }
    });
    res.json(response.success(productClasses));
  } catch (error: any) {
    return responseOnOauthError(res, error);
  }
});

async function getProductClasses(gameId: string) {
  const aggregateQuery: PipelineStage[] = [
    {
      $match: {
        game_id: gameId, active: true
      }
    },
    {
      $project: {
        _id: 0,
        __v: 0,
        active: 0,
        game_id: 0,
        id: 0,
        "product_types._id": 0
      },
    },
    {
      $sort: {
        order: 1,
      },
    }
  ];
  const results = await GameProductClassification.aggregate(aggregateQuery);
  return results;
}

async function getGameProducts(gameId: string) {
  const aggregateQuery: PipelineStage[] = [
    {
      $match: {
        game_id: gameId, active: true
      }
    },
    {
      $project: {
        _id: 0,
        __v: 0,
        active: 0,
        game_id: 0,
      },
    }
  ];
  const results = await GameProduct.aggregate(aggregateQuery);
  return results;
} 

async function getProductPurchase(gameId: string, userId: string) {
  const aggregateQuery: PipelineStage[] = [
    {
      $match: {
        game_id: gameId,
        user_id: userId
      }
    },
    {
      $project: {
        _id: 0,
        __v: 0,
        game_id: 0,
      },
    },
    {
      $group: {
        _id: {
          product_id: "$product_id",
          purchase_period: "$purchase_period",
        },
        count: {$sum: 1}
      }
    },
    {
      $project: { _id: 0, product_id: '$_id.product_id', period: '$_id.purchase_period', count: 1 }
    }
  ];
  const results = await GameProductPurchase.aggregate(aggregateQuery);
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