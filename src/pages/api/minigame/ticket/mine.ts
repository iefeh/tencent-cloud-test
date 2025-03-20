
import type { NextApiResponse } from "next";
import { createRouter } from "next-connect";
import * as response from "@/lib/response/response";
import { maybeAuthInterceptor, mustAuthInterceptor, UserContextRequest } from "@/lib/middleware/auth";
import { ticketRemain } from "../../oauth2/minigame/ticket/mine";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(mustAuthInterceptor).get(async (req, res) => {
  const userId = req.userId!;
  const { game_id } = req.query;
  const gameId = String(game_id);

  const ticketsCount = await ticketRemain(userId, gameId);

  res.json(response.success({ available_tickets: ticketsCount }));
  return;
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