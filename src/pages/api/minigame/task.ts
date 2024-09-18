
import type { NextApiResponse } from "next";
import { createRouter } from "next-connect";
import * as response from "@/lib/response/response";
import { maybeAuthInterceptor, UserContextRequest } from "@/lib/middleware/auth";
import { paginationQuests } from "../battlepass/tasks";
import QuestAchievement from "@/lib/models/QuestAchievement";
import { enrichUserQuests } from "@/lib/quests/questEnrichment";
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
  let detail: any = await findGameDetail(client_id as string,{ $project: { _id: 0, task_category: 1 } });
  if (!detail) {
    res.json(response.invalidParams());
    return;
  }

  await enrichTasks(userId, detail);

  res.json(response.success(detail));
  return;
});

async function enrichTasks(userId: string | undefined, detail: any) {
  // 查询是否完成分享任务
  if (detail.share_task) {
    const achivement = await QuestAchievement.findOne({ user_id: userId, quest_id: detail.share_task });
    detail.share_reward_claimed = !!achivement;
    delete detail.share_task;
  }

  const result = await paginationQuests(1, 100, detail.task_category, undefined, userId as string);
  delete detail.task_category;
  if (result && result.quests.length > 0) {
    let quests: any[] = result.quests;
    await enrichUserQuests(userId!, quests);
    detail.tasks = quests;
    return;
  }

  detail.tasks = [];
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