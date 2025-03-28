import type { NextApiResponse } from "next";
import { createRouter } from "next-connect";
import * as response from "@/lib/response/response";
import { mustAuthInterceptor, UserContextRequest } from "@/lib/middleware/auth";
import { responseOnOauthError } from "@/lib/oauth2/response";
import { buyTicket } from "../../oauth2/minigame/ticket/paid";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(mustAuthInterceptor).post(async (req, res) => {
    try {

        const { gameId, txHash } = req.body;
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


// this will run if none of the above matches
router.all((req, res) => {
  if (req.method === 'OPTIONS') {
    return res.status(204).end(); // 预检请求返回 204，避免 GET 触发错误
  }
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