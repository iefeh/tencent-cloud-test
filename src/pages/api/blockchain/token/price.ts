import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import * as response from "@/lib/response/response";
import {UserContextRequest} from "@/lib/middleware/auth";
import {redis} from "@/lib/redis/client";
import axios from "axios";
import logger from "@/lib/logger/winstonLogger";
import {HttpsProxyGet} from "@/lib/common/request";

const router = createRouter<UserContextRequest, NextApiResponse>();

const allowTokens = ["ETH"];

router.get(async (req, res) => {
    // 检查当前查询的token是否存在
    const {token} = req.query;
    if (!token) {
        return res.json(response.invalidParams());
    }
    if (!allowTokens.includes(token as string)) {
        return res.json(response.invalidParams("Token not supported."));
    }
    // 缓存获取token价格
    // https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT
    let price = await redis.get(`token_price:${token}`);
    if (!price) {
        const response = await HttpsProxyGet(`https://api.binance.com/api/v3/ticker/price?symbol=${token}USDT`);
        if (response.data && response.data.price) {
            logger.info(`Get token price ${token} from binance: ${response.data.price}`);
            price = response.data.price!;
            await redis.set(`token_price:${token}`, response.data.price, "EX", 60 * 60);
        } else {
            throw new Error(JSON.stringify(response.data));
        }
    }
    return res.json(response.success({
        price,
    }));
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