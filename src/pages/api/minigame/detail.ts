
import type { NextApiResponse } from "next";
import { createRouter } from "next-connect";
import * as response from "@/lib/response/response";
import { maybeAuthInterceptor, UserContextRequest } from "@/lib/middleware/auth";
import MiniGame, { IMiniGame, MiniGames, MiniGameStatus } from "@/lib/models/MiniGame";
import { PipelineStage } from "mongoose";
import OAuth2Client from "@/lib/models/OAuth2Client";
import MiniGameDetail from "@/lib/models/MiniGameDetail";
import { enrichTicket } from "./list";
import { paginationQuests } from "../battlepass/tasks";
import ScoreLeaderboardConfig from "@/lib/models/2048ScoreLeaderboardConfig";
import UserScoreRank from "@/lib/models/2048UserScoreRank";
import User from "@/lib/models/User";
import { loadAllBadges } from "../badges/list";
import QuestAchievement from "@/lib/models/QuestAchievement";
import { checkClaimed } from "./claim";
import { enrichUserQuests } from "@/lib/quests/questEnrichment";

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
  await enrichGameInfo(detail, miniGame);// 添加游戏相关信息
  await enrichTicket(userId, [detail])
  await enrichTasks(userId, detail);
  await enrichRanking(userId, detail);
  await enrichBadge(userId, detail);
  await enrichShareReward(userId, detail);

  res.json(response.success(detail));
  return;
});

async function findDetail(client_id: string) {
  const pipeline: PipelineStage[] = [{ $match: { client_id: client_id } }, { $project: { _id: 0 } }];
  const results = await MiniGameDetail.aggregate(pipeline);
  return results[0];
}

async function enrichGameInfo(detail: any, miniGame: IMiniGame) {
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

  const client = await OAuth2Client.findOne({ client_id: detail.client_id });
  detail.name = client.client_name;
}

async function enrichTasks(userId: string | undefined, detail: any) {
  // 查询是否完成分享任务
  if (detail.share_task) {
    const achivement = await QuestAchievement.findOne({ user_id: userId, quest_id: detail.share_task });
    detail.share_reward_claimed = !!achivement;
    delete detail.share_task;
  }

  const result = await paginationQuests(1, 6, detail.task_category, undefined, userId as string);
  if (result && result.quests.length > 0) {
    let quests: any[] = result.quests;
    await enrichUserQuests(userId!, quests);
    detail.tasks = quests;
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

async function enrichShareReward(userId: string | undefined, detail: any) {
  if (!userId) {
    detail.share_reward_claimed = false;
    delete detail.share_reward;
    return;
  }

  detail.share_reward_claimed = await checkClaimed(userId, detail.client_id);
  delete detail.share_reward;
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