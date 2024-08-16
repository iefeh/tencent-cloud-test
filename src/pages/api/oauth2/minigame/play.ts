import type { NextApiResponse } from "next";
import { createRouter } from "next-connect";
import * as response from "@/lib/response/response";
import { UserContextRequest, dynamicCors } from "@/lib/middleware/auth";
import { responseOnOauthError } from "@/lib/oauth2/response";
import { OAuth2Scopes } from '@/lib/models/OAuth2Scopes';
import OAuth2Server from '@/lib/oauth2/server';
import { Request, Response } from '@node-oauth/oauth2-server';
import OAuth2Client from "@/lib/models/OAuth2Client";
import { ethers, keccak256, TransactionReceipt } from "ethers";
import { redis } from "@/lib/redis/client";
import GameTicket from "@/lib/models/GameTicket";
import { ticketRemain } from "./ticket/mine";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(dynamicCors).get(async (req, res) => {
    let lockKey: any = undefined;
    try {
        const token = await OAuth2Server.authenticate(new Request(req), new Response(res), { scope: OAuth2Scopes.UserInfo });
        const gameId = token.client.id;
        const userId = token.user.user_id;

        lockKey = `play,${gameId},${userId}`;
        const locked = await redis.set(lockKey, Date.now(), "EX", 60, "NX");
        if (!locked) {
            res.json(response.tooManyRequests());
            return;
        }

        const result = await consumeTicket(userId, gameId);
        if (result.modifiedCount === 0) {
            // 门票不足
            res.json(response.insufficientTickets())
            return;
        }

        // 消费成功
        res.json(response.success());
    } catch (error: any) {
        return responseOnOauthError(res, error);
    } finally {
        if (lockKey) {
            await redis.del(lockKey);
        }
    }
});

export async function consumeTicket(userId: string, gameId: string) {
    return await GameTicket.updateOne({ user_id: userId, game_id: gameId, expired_at: { $gt: Date.now() }, consumed_at: null }, { $set: { consumed_at: Date.now() } });
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