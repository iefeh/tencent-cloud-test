
import type { NextApiResponse } from "next";
import { createRouter } from "next-connect";
import * as response from "@/lib/response/response";
import { maybeAuthInterceptor, UserContextRequest } from "@/lib/middleware/auth";
import { MiniGames } from "@/lib/models/MiniGame";
import { PipelineStage } from "mongoose";
import ScoreLeaderboardConfig from "@/lib/models/2048ScoreLeaderboardConfig";
import UserScoreRank from "@/lib/models/2048UserScoreRank";
import User from "@/lib/models/User";
import { findGameDetail } from "./overview";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(maybeAuthInterceptor).get(async (req, res) => {
  const { client_id } = req.query;
  if (!client_id) {
    res.json(response.invalidParams());
    return
  }
  const userId = req.userId;

  // 查询游戏详情
  let detail: any = await findGameDetail(client_id as string, { $project: { _id: 0, ranking: 1 } });
  if (!detail) {
    res.json(response.invalidParams());
    return;
  }

  await enrichRanking(userId, detail);

  res.json(response.success(detail));
  return;
});

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
              $project: { _id: 0, __v: 0, leaderboard_id: 0 }
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
          const infos: any[] = await User.find({ user_id: { $in: userIds } }, { user_id: 1, username: 1, avatar_url: 1, _id: 0 });
          const userIdInfoMap: Map<string, any> = new Map<string, any>(infos.map(info => [info.user_id, info]));
          let rank: number = 0;
          for (let lb of lbInfos) {
            lb.rank = ++rank;
            lb.player = userIdInfoMap.get(lb.uid).username;
            lb.avatar = userIdInfoMap.get(lb.uid).avatar_url;
            lb.score = lb.sum_score;
            delete lb.sum_score;
            delete lb.uid;
          }
          // 查询用户排行信息
          let userRank: any = '-';
          if (userId) {
            const userRankInfo = await UserScoreRank.findOne({ leaderboard_id: lbconfig.lbid, uid: userId });
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
    delete detail.ranking.game;
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