import type { NextApiResponse } from "next";
import { createRouter } from "next-connect";
import * as response from "@/lib/response/response";
import { UserContextRequest, dynamicCors } from "@/lib/middleware/auth";
import { responseOnOauthError } from "@/lib/oauth2/response";
import { OAuth2Scopes } from '@/lib/models/OAuth2Scopes';
import OAuth2Server from '@/lib/oauth2/server';
import { Request, Response } from '@node-oauth/oauth2-server';
import logger from "@/lib/logger/winstonLogger";
import { redis } from "@/lib/redis/client";
import GameTicket from "@/lib/models/GameTicket";
import { ticketRemain } from "./ticket/mine";
import doTransaction from "@/lib/mongodb/transaction";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(dynamicCors).get(async (req, res) => {
    let lockKey: any = undefined;
    try {
        const token = await OAuth2Server.authenticate(new Request(req), new Response(res), { scope: OAuth2Scopes.UserInfo });
        const gameId = token.client.id;
        const userId = token.user.user_id;
        const { count } = req.query;// 消耗的门票数量

        lockKey = `play,${gameId},${userId}`;
        const locked = await redis.set(lockKey, Date.now(), "EX", 2*60, "NX");
        if (!locked) {
            res.json(response.tooManyRequests());
            return;
        }

        let waitConsumeTicket = 1;
        if (count) {
            waitConsumeTicket = Number(count);
        }

        let result = await consumeTicket(userId, gameId, waitConsumeTicket);
        if (result.modifiedCount !== waitConsumeTicket) {
            // 门票不足
            res.json(response.insufficientTickets(result));
            return;
        }
        console.log(result);
        // 消费成功
        res.json(response.success(result));
    } catch (error: any) {
        return responseOnOauthError(res, error);
    } finally {
        if (lockKey) {
            await redis.set(lockKey, Date.now(), "EX", 10);// 兑换完成后保留10s缓冲，防止重复点击
        }
    }
});

export async function consumeTicket(userId: string, gameId: string, count: any) {
    let result = { modifiedCount: 0, ticketRemain: 0 };
    let remain = await ticketRemain(userId, gameId);
    result.ticketRemain = remain;

    if (!count) {
        count = 1;// 默认消耗1张门票
    }

    // 检查门票是否充足
    if (remain < count) {
        return result;
    }
    try {
        await doTransaction(async (session) => {
            for (let i = 0; i < Number(count); i++) {
                const consumeResult = await GameTicket.updateOne({ user_id: userId, game_id: gameId, expired_at: { $gt: Date.now() }, consumed_at: null }, { $set: { consumed_at: Date.now() } }, { session: session });

                if (consumeResult.modifiedCount === 0) {
                    throw new Error("Insufficient ticket.")
                }

                result.modifiedCount += consumeResult.modifiedCount;
            }
        });
    } catch (error) {
        logger.error(error);
    }

    if (result.modifiedCount !== count) {
        result.modifiedCount = 0;
    }

    // 查询余额
    result.ticketRemain = remain - count;
    return result;
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