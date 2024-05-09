import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import * as response from "@/lib/response/response";
import {mustAuthInterceptor, UserContextRequest} from "@/lib/middleware/auth";
import {errorInterceptor} from '@/lib/middleware/error';
import UserLotteryDrawHistory from "@/lib/models/UserLotteryDrawHistory";

const router = createRouter<UserContextRequest, NextApiResponse>();
router.use(errorInterceptor(), mustAuthInterceptor).get(async (req, res) => {
  const { lottery_pool_id } = req.query;
  const drawHistory = await UserLotteryDrawHistory.find({ user_id: req.userId, lottery_pool_id: lottery_pool_id });
  res.json(response.success({ drawHistory }));
});

// this will run if none of the above matches
router.all((req, res) => {
  res.status(405).json({
    error: 'Method not allowed',
  });
});

export default router.handler({
  onError(err, req, res) {
    console.error(err);
    res.status(500).json(response.serverError());
  },
});