
import type { NextApiResponse } from "next";
import { createRouter } from "next-connect";
import * as response from "@/lib/response/response";
import { maybeAuthInterceptor, UserContextRequest } from "@/lib/middleware/auth";
import MiniGame, { IMiniGame, MiniGames, MiniGameStatus } from "@/lib/models/MiniGame";
import { PipelineStage } from "mongoose";
import UserBackpackModel from "@/lib/models/UserBackpack";
import OAuth2Client from "@/lib/models/OAuth2Client";
import MiniGameDetail, { IMiniGameDetail } from "@/lib/models/MiniGameDetail";
import { any } from "video.js/dist/types/utils/events";
import { enrichTicket } from "./list";
import { paginationQuests } from "../battlepass/tasks";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(maybeAuthInterceptor).get(async (req, res) => {
  const { client_id } = req.query;
  if (!client_id) {
    res.json(response.invalidParams());
    return
  }
  const userId = req.userId;

  // 查询是否存在对应游戏
  const miniGame = await MiniGame.findOne({ client_id: client_id, active: true });
  if (!miniGame) {
    res.json(response.success());
    return;
  }

  // 查询游戏详情
  let detail: any = await findDetail(miniGame.client_id);
  enrichGameInfo(detail, miniGame);// 添加游戏相关信息
  enrichTicket(userId, [detail])
  enrichTasks(userId, detail);
  enrichRanking(userId, detail);
  enrichBadge(userId, detail);

  res.json(response.success(detail));
  return;
});

async function findDetail(client_id: string) {
  const pipeline: PipelineStage[] = [{ $match: { client_id: client_id } }, { $project: { _id: 0 } }];
  const results = await MiniGameDetail.aggregate(pipeline);
  return results[0];
}

function enrichGameInfo(detail: any, miniGame: IMiniGame) {
  detail.url = miniGame.url;
  detail.img_url = miniGame.img_url;
  detail.ticket = miniGame.ticket;

  // 判断游戏状态
  const now = Date.now();
  if (miniGame.end_time < now) {
    // 等待下一轮
    detail.status = MiniGameStatus.WaitForNextRound;
  } else if (miniGame.start_time > now) {
    // 即将开始
    detail.status = MiniGameStatus.ComingSoon;
  } else {
    // 进行中
    detail.status = MiniGameStatus.InProgress;
  }
}

async function enrichTasks(userId: string | undefined, detail: any) {
  let tasks: any[] = [];
  if (userId) {
    const result = await paginationQuests(1, 6, detail.task_category, undefined, userId);
    tasks = result.quests;
  }
  detail.tasks = tasks;
}

async function enrichRanking(userId: string | undefined, detail: any) {
  detail.ranking.leaderboard = [];
  if (detail.ranking.game) {
    switch (detail.ranking.game) {
      case MiniGames.Puffy2048:
        // 查询总的排行榜
        
        break;
    }
  }
}

async function enrichBadge(userId: string | undefined, detail: any) { }



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