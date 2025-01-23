import type { NextApiResponse } from "next";
import { createRouter } from "next-connect";
import * as response from "@/lib/response/response";
import { UserContextRequest, dynamicCors } from "@/lib/middleware/auth";
import { responseOnOauthError } from "@/lib/oauth2/response";
import { OAuth2Scopes } from '@/lib/models/OAuth2Scopes';
import OAuth2Server from '@/lib/oauth2/server';
import { Request, Response } from '@node-oauth/oauth2-server';
import OAuth2Client from "@/lib/models/OAuth2Client";
import { ethers } from "ethers";
import UserWallet from "@/lib/models/UserWallet";
import logger from "@/lib/logger/winstonLogger";
import GameTicket from "@/lib/models/GameTicket";
import { redis } from "@/lib/redis/client";
import MiniGameDetail from "@/lib/models/MiniGameDetail";
import { ticketRemain } from "./mine";
import { WALLECT_NETWORKS } from "@/constant/mint";
import BlockChain from "@/lib/models/BlockChain";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(dynamicCors).post(async (req, res) => {
    try {
        const token = await OAuth2Server.authenticate(new Request(req), new Response(res), { scope: OAuth2Scopes.UserInfo });
        const gameId = token.client.id;

        const { txHash } = req.body;
        if (!txHash) {
            res.json(response.invalidParams());
            return;
        }

        const result = await buyTicket(gameId, txHash)
        res.json(response.success(result));

    } catch (error: any) {
        return responseOnOauthError(res, error);
    }
});

export async function buyTicket(clientId: string, txHash: string) {
    const game = await MiniGameDetail.findOne({ client_id: clientId }, { client_id_hash: 1, chain_id: 1, _id: 0 });
    const voucher = await getPurchaseTicketEvnet(game, txHash);

    if (!voucher) {
        logger.warn(`Transaction ${txHash} cannot be recognized as pass payment.`);
        throw new Error("Transaction cannot be recognized.");
    }
    // 检查购票的游戏是否匹配
    if (voucher.gameIdHash != game.client_id_hash) {
        throw new Error("Game mismatch.");
    }

    // 校验钱包
    const userWallet = await UserWallet.findOne({ wallet_addr: voucher.to.toLowerCase(), deleted_time: null });
    if (!userWallet) {
        logger.warn(`Wallet ${voucher.to.toLowerCase()} has no account.`);
        throw new Error("Transaction cannot be recognized.");
    }

    // 生成门票
    // 缓存门票过期时间
    const cachedKey = `ticket-expiration:${clientId}`;
    let expiredAt: any = await redis.get(cachedKey);
    if (!expiredAt) {
        const expiration = await MiniGameDetail.findOne({ client_id: clientId }, { _id: 0, ticket_expired_at: 1 });
        if (expiration.ticket_expired_at) {
            expiredAt = expiration.ticket_expired_at;
        } else {
            // 若未配置门票过期时间，则给一个大值，保证门票不过期。
            expiredAt = 10 * Date.now();
        }
        await redis.setex(cachedKey, 60, expiredAt);
    }
    expiredAt = Number(expiredAt);

    let tickets: any[] = [];
    for (let i = 0; i < voucher.tickets; i++) {
        const ticket = new GameTicket();
        ticket.pass_id = ethers.id(`${txHash}-${i}`);
        ticket.user_id = userWallet.user_id;
        ticket.game_id = clientId;
        ticket.created_at = Date.now();
        ticket.expired_at = expiredAt;
        tickets.push(ticket);
    }
    // 保存门票
    if (tickets.length > 0) {
        try {
            await GameTicket.insertMany(tickets);
        } catch (error: any) {
            if (error.code !== 11000) {
                logger.warn(error);
            }
        }
    }
    const ticketsCount = await ticketRemain(userWallet.user_id, clientId);
    return { available_tickets: ticketsCount };
}


async function getPurchaseTicketEvnet(game: any, txHash: string) {
    let receipt = await getTokenTransactionReceiptByHash(game.chain_id, txHash, 30, 1000);
    if (!receipt || receipt.status !== 1) {
        return null;
    }

    // 使用事件签名的哈希值来过滤日志
    const eventSignature = ethers.id("BuyTicket(address,address,uint256,bytes32,uint256)");
    const ticketContractAddress = process.env.GAME_TICKET_CONTRACT_ADDRESS!;
    let logs: ethers.Log[] = receipt.logs.filter(log => log.address.toLowerCase() === ticketContractAddress.toLowerCase() && log.topics[0] === eventSignature);
    if (logs.length === 0) {
        return null;
    }

    let ticketAbi = ["event BuyTicket(address indexed player, address indexed token, uint256 tokenAmount, bytes32 game, uint256 tickets)"];
    let ticketInterface: ethers.Interface = new ethers.Interface(ticketAbi);
    let log = ticketInterface.parseLog(logs[0]);
    if (!log) {
        return;
    }

    return {
        to: ethers.getAddress(log.args[0]),
        nonce: Number(log.args[1]),
        gameIdHash: log.args[3],
        tickets: Number(log.args[4]),
    };
}

export async function getTokenTransactionReceiptByHash(chainId: string, txHash: string, maxWaitTimeSeconds: number, checkIntervalMillis: number = 5000) {
    const chainInfo = await BlockChain.findOne({ chain_id: chainId });
    const provider = new ethers.JsonRpcProvider(chainInfo.private_rpc_url);

    // 每隔5秒检查一次交易是否存在
    const maxAttempts = Math.ceil(maxWaitTimeSeconds * 1000 / checkIntervalMillis);
    let attempts = 0;

    while (attempts < maxAttempts) {
        const receipt = await provider.getTransactionReceipt(txHash);
        if (receipt) {
            return receipt;
        }
        attempts++;
        await new Promise(resolve => setTimeout(resolve, checkIntervalMillis)); // 等待5秒再检查
        console.log(attempts);
    }

    return null; // 超出最大等待时间后返回null
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