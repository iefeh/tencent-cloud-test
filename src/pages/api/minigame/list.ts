import type { NextApiResponse } from "next";
import { createRouter } from "next-connect";
import * as response from "@/lib/response/response";
import { maybeAuthInterceptor, UserContextRequest } from "@/lib/middleware/auth";
import MiniGame, { MiniGames, MiniGameStatus } from "@/lib/models/MiniGame";
import { PipelineStage } from "mongoose";
import UserBackpackModel from "@/lib/models/2048UserBackpack";
import OAuth2Client from "@/lib/models/OAuth2Client";
import { ticketRemain } from "../oauth2/minigame/ticket/mine";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(maybeAuthInterceptor).get(async (req, res) => {
  const { page_num, page_size, status, ticket_available } = req.query;
  if (!page_num || !page_size) {
    res.json(response.invalidParams());
    return
  }

  const userId = req.userId;
  const pageNum = Number(page_num);
  const pageSize = Number(page_size);
  const ticketAvailable: any = ticket_available;

  const pagination = await paginateMiniGame(pageNum, pageSize, status as MiniGameStatus, ticketAvailable);
  if (pagination.total == 0 || pagination.games.length == 0) {
    // 当前没有数据
    res.json(response.success({
      total: pagination.total,
      page_num: pageNum,
      page_size: pageSize,
      quests: pagination.games,
    }));
    return;
  }

  // 添加额外信息
  const games = pagination.games;
  enrichStatus(games);
  await enrichTicket(userId, games);
  await enrichClient(games);

  res.json(response.success({
    total: pagination.total,
    page_num: pageNum,
    page_size: pageSize,
    quests: games,
  }));
});

async function paginateMiniGame(pageNum: number, pageSize: number, status: MiniGameStatus, ticketAvailable: any): Promise<{ total: number, games: any[] }> {
  const skip = (pageNum - 1) * pageSize;
  const now = Date.now();

  // 拼接聚合查询的条件
  let match: any = { $match: { active: true } };

  // 若要查询可购票的小游戏，状态必须为InProgress，且
  if (ticketAvailable) {
    status = MiniGameStatus.InProgress;
    match.$match.ticket = { $exists: true };
  }

  // 查询进行中的游戏，需要判断开始时间和结束时间
  switch (status) {
    case MiniGameStatus.InProgress:
      match.$match.start_time = { $lte: now };
      match.$match.end_time = { $gt: now };
      break;
    case MiniGameStatus.ComingSoon:
      match.$match.start_time = { $gt: now };
      break;
    case MiniGameStatus.WaitForNextRound:
      match.$match.end_time = { $lt: now };
      break;
  }

  const pipeline: PipelineStage[] = [
    match,
    {
      $sort: {
        // 按照'order'升序排序
        'order': 1
      }
    },
    {
      $project: {
        '_id': 0,
        '__v': 0,
        'created_time': 0,
        'updated_time': 0,
        'active': 0,
        'order': 0
      }
    },
    {
      $facet: {
        metadata: [{ $count: "total" }],
        data: [{ $skip: skip }, { $limit: pageSize }]
      }
    }
  ];

  // 查询游戏
  const results = await MiniGame.aggregate(pipeline);
  if (results[0].metadata.length == 0) {
    return { total: 0, games: [] }
  }

  return { total: results[0].metadata[0].total, games: results[0].data }
}

// 添加游戏状态
function enrichStatus(games: any[]) {
  const now = Date.now();
  for (let q of games) {
    if (q.end_time < now) {
      // 等待下一轮
      q.status = MiniGameStatus.WaitForNextRound;
    } else if (q.start_time > now) {
      // 即将开始
      q.status = MiniGameStatus.ComingSoon;
    } else {
      // 进行中
      q.status = MiniGameStatus.InProgress;
    }
  }
}

// 添加游戏状态
export async function enrichTicket(userId: string | undefined, games: any[]) {
  const now = Date.now();
  for (let q of games) {
    if (q.ticket) {
      // 未登录则票数为0
      if (!userId) {
        q.ticket.remain = 0;
        delete q.ticket.game;
        continue;
      }
      // 是否可查询票数
      switch (q.ticket.game) {
        case MiniGames.Puffy2048:
          const pack = await UserBackpackModel.findOne({ uid: userId });
          q.ticket.remain = pack ? pack.num : 0;
          break;
        default:
          q.ticket.remain = await ticketRemain(userId, q.client_id);
          break;
      }
      delete q.ticket.game;
    }
  }
}

// 添加游戏状态
async function enrichClient(games: any[]) {
  const clientIds: string[] = games.map(g => g.client_id);
  const clients = await OAuth2Client.find({ client_id: { $in: clientIds } }, { client_id: 1, client_name: 1, icon_url: 1 });
  const clientInfoMap: Map<string, any> = new Map<string, any>(clients.map(c => [c.client_id, c]));

  let info: any;
  for (let q of games) {
    info = clientInfoMap.get(q.client_id);
    if (info) {
      q.client_name = info.client_name;
      if (!q.icon_url) {
        q.icon_url = info.icon_url;
      }
    }
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