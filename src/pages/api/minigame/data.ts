
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
  const data: any = {};
  data.task_category = detail.task_category;
  data.game_data = [];
  data.game_data.push({ name: "Current Gold Pool", value: 32454 })
  data.game_data.push({ name: "Top 1 Player Gold", value: 12546 })
  data.game_data.push({ name: "Current Online Players", value: 5856 })
  data.game_data.push({ name: "Unoccupied Castles", value: 15 })
  res.json(response.success(data));

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