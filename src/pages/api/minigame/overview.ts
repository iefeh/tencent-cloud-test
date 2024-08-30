
import type { NextApiResponse } from "next";
import { createRouter } from "next-connect";
import * as response from "@/lib/response/response";
import { maybeAuthInterceptor, UserContextRequest } from "@/lib/middleware/auth";
import MiniGame, { IMiniGame, MiniGames, MiniGameStatus } from "@/lib/models/MiniGame";
import { PipelineStage } from "mongoose";
import OAuth2Client from "@/lib/models/OAuth2Client";
import MiniGameDetail from "@/lib/models/MiniGameDetail";
import { enrichTicket } from "./list";
import { checkClaimed } from "./claim";

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
    res.json(response.invalidParams());
    return;
  }

  // 查询游戏详情
  let detail: any = await findGameDetail(miniGame.client_id, { $project: { _id: 0, badge: 0, task_category: 0, ranking: 0 } });
  await enrichGameInfo(detail, miniGame);// 添加游戏相关信息
  await enrichTicket(userId, [detail]);
  await enrichShareReward(userId, detail);
  enrichStatus(miniGame, detail);

  res.json(response.success(detail));
  return;
});

export async function findGameDetail(client_id: string, project: any) {
  const pipeline: PipelineStage[] = [{ $match: { client_id: client_id } }, project];
  const results = await MiniGameDetail.aggregate(pipeline);
  return results.length > 0 ? results[0] : undefined;
}

async function enrichGameInfo(detail: any, miniGame: IMiniGame) {
  detail.url = miniGame.url;
  detail.img_url = miniGame.img_url;
  detail.icon_url = miniGame.icon_url;
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

  const client = await OAuth2Client.findOne({ client_id: detail.client_id });
  detail.name = client.client_name;
}

async function enrichShareReward(userId: string | undefined, detail: any) {
  if (!userId) {
    detail.share_reward_claimed = false;
    delete detail.share_reward;
    return;
  }

  detail.share_reward_claimed = await checkClaimed(userId, detail.share_reward.round, detail.client_id);
  delete detail.share_reward;
}

function enrichStatus(game: any, detail: any) {
  const now = Date.now();
  if (game.end_time < now) {
    // 等待下一轮
    detail.status = MiniGameStatus.WaitForNextRound;
  } else if (game.start_time > now) {
    // 即将开始
    detail.status = MiniGameStatus.ComingSoon;
  } else {
    // 进行中
    detail.status = MiniGameStatus.InProgress;
  }
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