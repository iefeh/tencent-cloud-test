
import type { NextApiResponse } from "next";
import { createRouter } from "next-connect";
import * as response from "@/lib/response/response";
import { maybeAuthInterceptor, UserContextRequest } from "@/lib/middleware/auth";
import MiniGame, { IMiniGame, MiniGames, MiniGameStatus } from "@/lib/models/MiniGame";
import { PipelineStage } from "mongoose";
import UserBackpackModel from "@/lib/models/2048UserBackpack";
import OAuth2Client from "@/lib/models/OAuth2Client";
import MiniGameDetail, { IMiniGameDetail } from "@/lib/models/MiniGameDetail";
import { any } from "video.js/dist/types/utils/events";
import { enrichTicket } from "./list";
import { paginationQuests } from "../battlepass/tasks";
import ScoreLeaderboardConfig from "@/lib/models/2048ScoreLeaderboardConfig";
import UserScoreRank from "@/lib/models/2048UserScoreRank";
import User from "@/lib/models/User";
import { loadAllBadges } from "../badges/list";

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
  await enrichTicket(userId, [detail])
  await enrichTasks(userId, detail);
  await enrichRanking(userId, detail);
  await enrichBadge(userId, detail);

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
  const result = await paginationQuests(1, 6, detail.task_category, undefined, userId as string);
  if (result) {
    detail.tasks = result.quests;
    return;
  }

  detail.tasks = [];
}

async function enrichRanking(userId: string | undefined, detail: any) {
  if (detail.ranking.game) {
    switch (detail.ranking.game) {
      case MiniGames.Puffy2048:
        // 查询总的排行榜
        const now = Date.now();
        const lbconfig = await ScoreLeaderboardConfig.findOne({ start_time: { $lte: now }, end_time: { $gte: now } });
        if (lbconfig) {
          // 查询排行榜信息
          const pipeline: PipelineStage[] = [
            {
              $match: { leaderboard_id: lbconfig.lbid }
            },
            {
              $project: { _id: 0, leaderboard_id: 0 }
            },
            {
              $sort: { sum_score: -1 }
            },
            {
              $limit: 5
            }];

          let lbInfos: any[] = await UserScoreRank.aggregate(pipeline);
          let userIds = lbInfos.map(r => r.uid);

          // 查询用户昵称信息
          const infos: any[] = await User.find({ user_id: { $in: userIds } }, { user_id: 1, username: 1, _id: 0 });
          const userIdNameMap: Map<string, string> = new Map<string, string>(infos.map(info => [info.user_id, info.username]));
          let rank: number = 0;
          for (let lb of lbInfos) {
            lb.rank = ++rank;
            lb.player = userIdNameMap.get(lb.uid);
            lb.score = lb.sum_score;
            delete lb.sum_score;
            delete lb.uid;
          }
          // 查询用户排行信息
          let userRank: any = '-';
          if (userId) {
            const userRankInfo = await UserScoreRank.findOne({ leaderboard_id: lbconfig, uid: userId });
            if (userRankInfo) {
              userRank = await UserScoreRank.count({ leaderboard_id: lbconfig.lbid, sum_score: { $gt: userRankInfo.sum_score } });
              userRank++;
            }
          }

          // 保存排行榜信息
          detail.ranking.leaderboard = lbInfos;
          detail.ranking.user_rank = userRank;
        }
        break;
    }
  }
}

async function enrichBadge(userId: string | undefined, detail: any) {
  if (detail.badge && detail.badge.length > 0) {
    let badgeIds: string[] = [];
    for (let b of detail.badge) {
      badgeIds.push(b.badge_id)
    }

    const [badges, count, total] = await loadAllBadges(userId as string, 1, 5, badgeIds);
    delete detail.badge;
    detail.badge = badges;
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