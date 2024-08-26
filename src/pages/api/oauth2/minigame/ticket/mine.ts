import type { NextApiResponse } from "next";
import { createRouter } from "next-connect";
import * as response from "@/lib/response/response";
import { UserContextRequest, dynamicCors } from "@/lib/middleware/auth";
import { responseOnOauthError } from "@/lib/oauth2/response";
import { OAuth2Scopes } from '@/lib/models/OAuth2Scopes';
import OAuth2Server from '@/lib/oauth2/server';
import { Request, Response } from '@node-oauth/oauth2-server';
import GameTicket from "@/lib/models/GameTicket";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(dynamicCors).get(async (req, res) => {
    try {
        const token = await OAuth2Server.authenticate(new Request(req), new Response(res), { scope: OAuth2Scopes.UserInfo });
        const gameId = token.client.id;
        const userId = token.user.user_id;

        const ticketsCount = await ticketRemain(userId, gameId);

        res.json(response.success({ available_tickets: ticketsCount }));
    } catch (error: any) {
        return responseOnOauthError(res, error);
    }
});

export async function ticketRemain(userId: string, gameId: string) {
    return await GameTicket.count({ user_id: userId, game_id: gameId, expired_at: { $gt: Date.now() }, consumed_at: null });
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