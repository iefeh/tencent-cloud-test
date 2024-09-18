
import type { NextApiResponse } from "next";
import { createRouter } from "next-connect";
import * as response from "@/lib/response/response";
import { maybeAuthInterceptor, UserContextRequest } from "@/lib/middleware/auth";
import { MiniGameStatus } from "@/lib/models/MiniGame";
import { loadAllBadges } from "../badges/list";
import { checkClaimed } from "./claim";
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
  let detail: any = await findGameDetail(client_id as string, { $project: { _id: 0, badge: 1 } });
  if (!detail) {
    res.json(response.invalidParams());
    return;
  }
  await enrichBadge(userId, detail);

  res.json(response.success(detail));
  return;
});

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