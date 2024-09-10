import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import * as response from "@/lib/response/response";
import {dynamicCors, mustAuthInterceptor, UserContextRequest} from "@/lib/middleware/auth";
import Mint, {IMint} from "@/lib/models/Mint";
import Contract, {ContractCategory, IContract} from "@/lib/models/Contract";
import {redis} from "@/lib/redis/client";

import Badges from "@/lib/models/Badge";
import doTransaction from "@/lib/mongodb/transaction";
import IpfsMetadata from "@/lib/models/IpfsMetadata";
import UserWallet, {IUserWallet} from "@/lib/models/UserWallet";
import {ethers} from 'ethers';
import {responseOnOauthError} from "@/lib/oauth2/response";
import OAuth2Server from "@/lib/oauth2/server";
import {Request, Response} from "@node-oauth/oauth2-server";
import {OAuth2Scopes} from "@/lib/models/OAuth2Scopes";
import {IMiniGameDetail} from "@/lib/models/MiniGameDetail";

const pinataSDK = require('@pinata/sdk');
const pinata = new pinataSDK({pinataJWTKey: process.env.PINATA_JWT!});

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(dynamicCors).get(async (req, res) => {
    let lockKey: string;
    try {
        const token = await OAuth2Server.authenticate(new Request(req), new Response(res), {scope: OAuth2Scopes.UserInfo});
        const userId = token.user.user_id;
        const gameId = token.client.id;

        const {productId, tokenId} = req.query;
        if (!productId || !tokenId) {
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
        const purchaseRequest = await checkUserGameProductPurchaseRequest(userId, gameId, productId as string, tokenId as string);
        if (!purchaseRequest) {
            return res.json(response.invalidParams({message: "Invalid purchase request."}));
        }
        // 生成购买许可
        const paymentContract = await Contract.findOne({
            chain_id: purchaseRequest.payment_chain_id,
            category: ContractCategory.GAME_PAYMENT
        }) as IContract;
        if (!paymentContract) {
            throw new Error("Game payment contract not found");
        }
        const permit = await generatePurchasePermit(purchaseRequest, paymentContract);
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

async function checkUserGameProductPurchaseRequest(userId: string, gameId: string, productId: string, tokenId: string): Promise<PurchaseRequest | null> {
    // 1. 检查支付的产品存在，且用户当前依然有购买资格
    // 2. 检查用户需要支付的代币数量
    // 3. 构建PurchaseRequest
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
    product_price_in_usd: string;
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
    payment_token_price_in_usd: string;
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