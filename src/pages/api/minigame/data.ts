
import type { NextApiResponse } from "next";
import { createRouter } from "next-connect";
import * as response from "@/lib/response/response";
import { maybeAuthInterceptor, UserContextRequest } from "@/lib/middleware/auth";
import { findGameDetail } from "./overview";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(maybeAuthInterceptor).get(async (req, res) => {
  const clientId = "0eecc987-2349-46ab-b043-f7932e607a66";
  // 查询游戏详情
  let detail: any = await findGameDetail(clientId, { $project: { _id: 0, task_category: 1 } });
  // if (!detail) {
  //   res.json(response.invalidParams());
  //   return;
  // }

  res.json(response.success({ task_category: detail.task_category, current_gold_pool: 32454, top1_gold: 12546, online_player: 5856, unoccupied_castles: 15 }));

  return;
});


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