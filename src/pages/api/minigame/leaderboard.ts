
import type { NextApiResponse } from "next";
import { createRouter } from "next-connect";
import * as response from "@/lib/response/response";
import { maybeAuthInterceptor, UserContextRequest } from "@/lib/middleware/auth";
import { MiniGames } from "@/lib/models/MiniGame";
import { findGameDetail } from "./overview";
import Puffy2048ScoreLeaderboardConfig from "@/lib/models/2048ScoreLeaderboardConfig";
import { PipelineStage } from "mongoose";
import { get2048Leaderboard } from "@/lib/models/2048UserScoreRank";
import GoldminerScoreLeaderboardConfig from "@/lib/models/GoldminerScoreLeaderboardConfig";
import { getGoldminerLeaderboard } from "@/lib/models/GoldminerUserScoreRank";
import BubblepopScoreLeaderboardConfig from "@/lib/models/BubblepopScoreLeaderboardConfig";
import { getBubblepopLeaderboard } from "@/lib/models/BubblepopUserScoreRank";

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
    // 查询总的排行榜
    const now = Date.now();
    const pipeline: PipelineStage[] = [
      {
        $match: {
          $or: [
            {
              start_time: {
                $lte: now
              }
            }
          ]
        }
      },
      {
        $sort: {
          end_time: -1
        }
      },
      { $limit: 2 },
      {
        $project: {
          _id: 0,
          lbid: 1,
          start_time: 1,
          end_time: 1
        }
      }
    ];

    switch (detail.ranking.game) {
      case MiniGames.Puffy2048:
        let puffy2048Lbconfigs = await Puffy2048ScoreLeaderboardConfig.aggregate(pipeline);
        if (puffy2048Lbconfigs.length > 0) {
          detail.leaderboard = {};
          const latest = await get2048Leaderboard(userId, puffy2048Lbconfigs[0].lbid);
          enrichLatest(detail, latest, puffy2048Lbconfigs[0]);

          if (puffy2048Lbconfigs.length > 1) {
            const previous = await get2048Leaderboard(userId, puffy2048Lbconfigs[1].lbid);
            enrichPrevious(detail, previous, puffy2048Lbconfigs[1]);
          }
        }
        break;
      case MiniGames.Goldminer:
        let goldminerLbconfigs = await GoldminerScoreLeaderboardConfig.aggregate(pipeline);
        if (goldminerLbconfigs.length > 0) {
          detail.leaderboard = {};
          const latest = await getGoldminerLeaderboard(userId, goldminerLbconfigs[0].lbid);
          enrichLatest(detail, latest, goldminerLbconfigs[0]);

          if (goldminerLbconfigs.length > 1) {
            const previous = await getGoldminerLeaderboard(userId, goldminerLbconfigs[1].lbid);
            enrichPrevious(detail, previous, goldminerLbconfigs[1]);
          }
        }
        break;
        case MiniGames.BubblePop:
          let bubblepopLbconfigs = await BubblepopScoreLeaderboardConfig.aggregate(pipeline);
          if (bubblepopLbconfigs.length > 0) {
            detail.leaderboard = {};
            const latest = await getBubblepopLeaderboard(userId, bubblepopLbconfigs[0].lbid);
            enrichLatest(detail, latest, bubblepopLbconfigs[0]);
  
            if (bubblepopLbconfigs.length > 1) {
              const previous = await getBubblepopLeaderboard(userId, bubblepopLbconfigs[1].lbid);
              enrichPrevious(detail, previous, bubblepopLbconfigs[1]);
            }
          }
          break;
    }
    delete detail.ranking;
  }
}

function enrichLatest(detail: any, data: any, config: any) {
  detail.leaderboard.latest = {};
  detail.leaderboard.latest.lbInfos = data.lbInfos;
  detail.leaderboard.latest.user_rank = data.userRank;
  detail.leaderboard.latest.start_time = config.start_time;
  detail.leaderboard.latest.end_time = config.end_time;
}

function enrichPrevious(detail: any, data: any, config: any) {
  detail.leaderboard.previous = {};
  detail.leaderboard.previous.lbInfos = data.lbInfos;
  detail.leaderboard.previous.user_rank = data.userRank;
  detail.leaderboard.previous.start_time = config.start_time;
  detail.leaderboard.previous.end_time = config.end_time;
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