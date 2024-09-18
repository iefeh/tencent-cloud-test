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
import { PipelineStage } from "mongoose";
import { ticketRemain } from "./ticket/mine";
// import { ticketRemain } from "./ticket/mine";
// import doTransaction from "@/lib/mongodb/transaction";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(dynamicCors).get(async (req, res) => {
    let lockKey: any = undefined;
    try {
        const token = await OAuth2Server.authenticate(new Request(req), new Response(res), { scope: OAuth2Scopes.UserInfo });
        const gameId = token.client.id;
        const userId = token.user.user_id;
        // const { count } = req.query;// 消耗的门票数量

        lockKey = `play,${gameId},${userId}`;
        const locked = await redis.set(lockKey, Date.now(), "EX", 2 * 60, "NX");
        if (!locked) {
            res.json(response.tooManyRequests());
            return;
        }

        // let waitConsumeTicket = 1;
        // if (count) {
        //     waitConsumeTicket = Number(count);
        // }


        let result = await consumeTicket(userId, gameId, 1);
        if (result.modifiedCount === 0) {
            // 门票不足
            res.json(response.insufficientTickets(result));
            return;
        }
        // console.log(result);
        // 消费成功
        res.json(response.success(result));
    } catch (error: any) {
        return responseOnOauthError(res, error);
    } finally {
        if (lockKey) {
            await redis.set(lockKey, Date.now(), "EX", 10);// 消费完成后保留10s缓冲，防止重复点击
        }
    }
});

export async function consumeTicket(userId: string, gameId: string, count: number) {
    let result: any = { modifiedCount: 0, ticketRemain: 0 };
    const pipeline: PipelineStage[] = [
        {
            $match: {
                user_id: userId,
                game_id: gameId,
                expired_at: { $gt: Date.now() },
                consumed_at: null
            }
        },
        {
            $sort: { expired_at: 1 }
        },
        {
            $project: { _id: 0, pass_id: 1 }
        },
        {
            $facet: {
                metadata: [{ $count: "total" }],
                data: [
                    { $limit: count }
                ],
            },
        }
    ];

    const data = await GameTicket.aggregate(pipeline);
    if (data[0].metadata.length == 0 || data[0].metadata[0].total == 0) {
        return result;
    }

    const consumeResult = await GameTicket.updateMany({ pass_id: { $in: data[0].data.map((d: any) => d.pass_id) } }, { $set: { consumed_at: Date.now() } });
    result.modifiedCount = consumeResult.modifiedCount;
    result.ticketRemain = Number(data[0].metadata[0].total) - Number(result.modifiedCount);

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