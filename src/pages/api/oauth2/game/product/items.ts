import type {NextApiResponse} from "next";
import { createRouter } from 'next-connect';

import {
    getFirstDayOfNextMonth, getFirstDayOfNextWeek, getISOFullDateTimeString,
    getISOMonthDayTimeString, getISOYearWeekString
} from '@/lib/common/timeUtils';
import { dynamicCors, UserContextRequest } from '@/lib/middleware/auth';
import { getGameProducts, ProductLimitType } from '@/lib/models/GameProduct';
import { getProductClasses } from '@/lib/models/GameProductClassification';
import { getUserProductPurchase } from '@/lib/models/GameProductPurchaseRequest';
import { getGameMaxDiscount } from '@/lib/models/GameProductToken';
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
      return res.json(response.serverError());
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
    });
    const currentWeek = getISOYearWeekString(new Date());
    const currentMonthDay = getISOMonthDayTimeString(new Date());
    const currentDate = getISOFullDateTimeString(new Date());
    const currentYear = String((new Date()).getFullYear());
    const gamePurchase = await getUserProductPurchase(userId, gameId as string, [ currentDate, currentWeek, currentMonthDay, currentYear ]);
    gamePurchase.forEach(purchase => {
      const product = productMap.get(purchase.product_id);
      // 根据产品限量周期和购买周期计算已售出数量
      if (product) {
        product.limit.sold_amount = purchase.count;
      }
    });
    // 查询所有token最高折扣
    let maxDiscount = 0;
    let discount = await getGameMaxDiscount();
    if (discount != null) {
      maxDiscount = discount;
    }
    gameProducts.forEach(gameProduct => {
      // 判断当前周期内产品是否已经售空
      if (gameProduct.limit.sold_amount === undefined) {
        gameProduct.limit.sold_amount = 0;
      }
      if (gameProduct.limit.sold_amount >= gameProduct.limit.amount) {
        gameProduct.sold_out = true;
        gameProduct.display_order = 999;
      } else {
        gameProduct.sold_out = false;
      }
      // 设置产品的最大折扣
      gameProduct.max_discount = maxDiscount;
      // 删除多余字段, 前端不需要展示
      delete gameProduct.limit.type;
      const targetArr = productTypeMap.get(gameProduct.product_type_id);
      if (targetArr) {
        delete gameProduct.product_type_id;
        targetArr.push(gameProduct);
        targetArr.sort((a, b) => a.display_order - b.display_order);
      }
    });
    const now = new Date();
    // 设置每个产品分类的库存刷新时间
    productClasses.forEach(productClass => {
      for (let productType of productClass.product_types) {
        productType.products = productTypeMap.get(productType.id);
        if (productType.limit_type === ProductLimitType.Daily) {
          productType.refresh_time = (new Date(now.getTime()+(24 * 60 * 60 * 1000))).setHours(0, 0, 0, 0);
        } else if (productType.limit_type === ProductLimitType.Weekly) {
          productType.refresh_time = getFirstDayOfNextWeek(now);
        } else if (productType.limit_type === ProductLimitType.Monthly) {
          productType.refresh_time = getFirstDayOfNextMonth(now);
        }
        delete productType.id;
      }
    });
    res.json(response.success(productClasses));
  } catch (error: any) {
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