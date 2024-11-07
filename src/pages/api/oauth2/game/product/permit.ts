import type {NextApiResponse} from "next";
import { ethers } from 'ethers';
import { createRouter } from 'next-connect';

import {
    getISOFullDateTimeString, getISOMonthDayTimeString, getISOYearWeekString
} from '@/lib/common/timeUtils';
import { dynamicCors, UserContextRequest } from '@/lib/middleware/auth';
import Contract, { ContractCategory, IContract } from '@/lib/models/Contract';
import GameProduct, { ProductLimitType } from '@/lib/models/GameProduct';
import GameProductPurchaseRequest, {
    getUserProductPurchase
} from '@/lib/models/GameProductPurchaseRequest';
import GameProductToken from '@/lib/models/GameProductToken';
import { OAuth2Scopes } from '@/lib/models/OAuth2Scopes';
import { isDuplicateKeyError } from '@/lib/mongodb/client';
import { responseOnOauthError } from '@/lib/oauth2/response';
import OAuth2Server from '@/lib/oauth2/server';
import { redis } from '@/lib/redis/client';
import * as response from '@/lib/response/response';
import { Request, Response } from '@node-oauth/oauth2-server';

const pinataSDK = require('@pinata/sdk');
const pinata = new pinataSDK({pinataJWTKey: process.env.PINATA_JWT!});

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(dynamicCors).get(async (req, res) => {
    let lockKey: string = "";
    try {
        const token = await OAuth2Server.authenticate(new Request(req), new Response(res), {scope: OAuth2Scopes.UserInfo});
        const userId = token.user.user_id;
        const gameId = token.client.id;

        const {product_id, token_id} = req.query;
        if (!product_id || !token_id) {
            return res.json(response.invalidParams());
        }
        // 锁定用户操作
        lockKey = `purchase_permit:${userId}:${gameId}`;
        const locked = await redis.set(lockKey, Date.now(), "EX", 15, "NX");
        if (!locked) {
            return res.json(response.tooManyRequests({
                message: "Purchase is under a 15s waiting period, please try again later.",
            }));
        }
        // 检查购买请求
        const verifyResult = await checkUserGameProductPurchaseRequest(userId, gameId, product_id as string, token_id as string);
        if (!verifyResult.verified || !verifyResult.purchaseRequest) {
            return res.json(response.invalidParams({ reach_purchase_limit: verifyResult.reach_purchase_limit, message: verifyResult.message }));
        }
        const purchaseRequest = verifyResult.purchaseRequest;
        // 生成购买许可
        const paymentContract = await Contract.findOne({
            chain_id: purchaseRequest.payment_chain_id,
            category: ContractCategory.GAME_PAYMENT
        }) as IContract;
        if (!paymentContract) {
            throw new Error("Game payment contract not found");
        }
        const permit = await generatePurchasePermit(purchaseRequest, paymentContract);
        // 保存购买请求
        try {
            const productPurchaseRequest = new GameProductPurchaseRequest({
                request_id: purchaseRequest.request_id,
                user_id: purchaseRequest.user_id,
                game_id: purchaseRequest.game_id,
                token_id: purchaseRequest.token_id,
                product_id: purchaseRequest.product_id,
                product_price_in_usd: purchaseRequest.product_price_in_usd,
                request_time: purchaseRequest.request_time,
                request_period: purchaseRequest.request_period,
                request_expire_time: purchaseRequest.request_expire_time,
                payment_token_address: purchaseRequest.payment_token_address,
                payment_token_amount: purchaseRequest.payment_token_amount,
                payment_token_price_in_usd: purchaseRequest.payment_token_price_in_usd,
            });
            await productPurchaseRequest.save();
        }
        catch (error) {
            console.log(error);
            if (!isDuplicateKeyError(error)) {
                throw error;
            }
        }
        return res.json(response.success({
            chain_id: paymentContract.chain_id,
            contract_address: paymentContract.address,
            permit: permit,
        }));
    } catch (error) {
        return responseOnOauthError(res, error);
    } finally {
        if (lockKey) {
            await redis.del(lockKey);
        }
    }
});

async function checkUserGameProductPurchaseRequest(userId: string, gameId: string, productId: string, tokenId: string): Promise<{ verified: boolean, reach_purchase_limit: boolean, message: string, purchaseRequest: PurchaseRequest | null }> {
    // 1. 检查支付的产品存在，且用户当前依然有购买资格
    const gameProduct = await GameProduct.findOne({ id: productId, game_id: gameId, active: true });
    if (!gameProduct) {
        return { verified: false, reach_purchase_limit: false, message: "Invalid product.", purchaseRequest: null };
    }
    const currentWeek = getISOYearWeekString(new Date());
    const currentMonthDay = getISOMonthDayTimeString(new Date());
    const currentDate = getISOFullDateTimeString(new Date());
    const currentYear = String((new Date()).getFullYear());
    let currentPurchasePeriod = currentDate;
    if (gameProduct.limit.type === ProductLimitType.Weekly) {
        currentPurchasePeriod = currentWeek;
    } else if (gameProduct.limit.type === ProductLimitType.Monthly) {
        currentPurchasePeriod = currentMonthDay;
    } else if (gameProduct.limit.type === ProductLimitType.Yearly) {
        currentPurchasePeriod = currentYear;
    }
    const gamePurchase = await getUserProductPurchase(userId, gameId, [ currentPurchasePeriod ], productId);
    let soldAmount = 0;
    if (gamePurchase.length > 0) {
        soldAmount = gamePurchase[0].count;
    }
    if (gameProduct.limit.amount <= soldAmount) {
        return { verified: false, reach_purchase_limit: true, message: "You have reached the maximum purchase limit for this product.", purchaseRequest: null };
    }
    // 2. 检查用户需要支付的代币数量
    const token = await GameProductToken.findOne({ id: tokenId });
    if (!token) {
        return { verified: false, reach_purchase_limit: false, message: "Invalid token id", purchaseRequest: null };
    }
    let tokenAmount = calculateTokenPaymentWithDiscount(gameProduct.price_in_usdc, token.price_in_usdc, token.product_discount, token.decimal);
    const now = Date.now();
    const pow = 10 ** 4; //价格保留4位小数
    const price =  Math.ceil(gameProduct.price_in_usdc*(1-token.product_discount)*pow)/pow;
    // 3. 构建PurchaseRequest
    let request: PurchaseRequest = {
        request_id: ethers.id(`productPermit:${gameId}:${productId}:${userId}:${currentPurchasePeriod}:${soldAmount+1}`),
        user_id: userId,
        game_id: gameId,
        token_id: tokenId,
        product_id: productId,
        product_id_hash: gameProduct.id_hash,
        product_price_in_usd: price,
        request_time: now,
        request_period: currentPurchasePeriod,
        request_expire_time: now + 10 * 60 * 1000,
        payment_chain_id: token.chain_id,
        payment_token_address: token.address,
        payment_token_amount: tokenAmount,
        payment_token_price_in_usd: token.price_in_usdc,
    };
    return { verified: true, reach_purchase_limit: false, message: "", purchaseRequest: request };
}

type PurchaseRequest = {
    // 请求id，生产规则 ethers.id(`productPermit:${gameId}:${productId}:${userId}:${Date.now()}`)
    request_id: string;
    // 用户id
    user_id: string;
    // 游戏id
    game_id: string;
    // 用户请求使用支付的代币id
    token_id: string;
    // 产品id
    product_id: string;
    // 产品id的hash
    product_id_hash: string;
    // 产品价格，用于当时价格
    product_price_in_usd: number;
    // 请求时间，毫秒时间戳
    request_time: number;
    // 请求的周期
    request_period: string;
    // 请求过期时间，毫秒时间戳
    request_expire_time: number;

    // 支付的网络id
    payment_chain_id: string;
    // 支付代币地址
    payment_token_address: string;
    // 支付代币数量，需要实际支付的代币数量，而非格式化后的数量
    payment_token_amount: string;
    // 代币价格
    payment_token_price_in_usd: number;
}

function calculateTokenPaymentWithDiscount(productPriceInUSD: number, tokenPriceInUSD: number, discount: number, decimals: number = 18): string {
    // 应用折扣
    const discountedPrice = productPriceInUSD * (1 - discount);
    const pow = 10 ** decimals;
    // 将折扣后的价格转换为高精度 BigInt（以 USD 的小数位扩大）
    const priceInWei = BigInt(Math.round(discountedPrice * pow)); // 提前乘以 pow 并进行四舍五入
    const tokenPriceInWei = BigInt(Math.round(tokenPriceInUSD * pow)); // 代币价格乘以 pow
    // 计算需要支付的 token 数量（这里将 priceInWei * 10^decimals 来放大倍数，确保精度）
    const tokenAmountInWei = (priceInWei * BigInt(pow)) / tokenPriceInWei;
    
    //保留6位精度
    let result = tokenAmountInWei.toString();
    if (decimals > 6) {
        const divisor = 10 ** (decimals - 6);
        let tempAmoutInWei = tokenAmountInWei / BigInt(divisor);
        if (needCeiling(result, decimals)) {
            tempAmoutInWei += BigInt(1);
        }
        tempAmoutInWei = tempAmoutInWei * BigInt(divisor);
        result = tempAmoutInWei.toString();
    }
    return result;
}

//从右向左找decimal - 6位, 出现非0则返回true
function needCeiling(sourceBigInt: string, decimals: number): boolean {
    if (decimals <= 6) {
        return false;
    }
    const checkDecimals = decimals - 6; //需要检查的位数
    for (let i = sourceBigInt.length - 1; i > sourceBigInt.length - checkDecimals - 1; i--) {
        if (sourceBigInt.charAt(i) !== "0") {
            return true;
        }
    }
    return false;
}

async function generatePurchasePermit(request: PurchaseRequest, gamePaymentContract: IContract) {
    const domain = {
        name: "GamePayment",
        version: "1",
        chainId: Number(gamePaymentContract.chain_id),
        verifyingContract: ethers.getAddress(gamePaymentContract.address),
    };
    const types = {
        ProductPermit: [
            {name: "reqId", type: "bytes32"},
            {name: "productId", type: "bytes32"},
            {name: "token", type: "address"},
            {name: "tokenAmount", type: "uint256"},
            {name: "expiration", type: "uint128"},
        ],
    };

    const productPermit: any = {
        reqId: request.request_id,
        productId: request.product_id_hash,
        token: request.payment_token_address,
        tokenAmount: request.payment_token_amount,
        expiration: Math.floor(Date.now() / 1000) + 600, // 10 min过期
    };
    const signer = new ethers.Wallet(process.env.DEVELOPER_PRIVATE_KEY!, null);
    productPermit.signature = await signer.signTypedData(domain, types, productPermit);
    return productPermit;
}

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