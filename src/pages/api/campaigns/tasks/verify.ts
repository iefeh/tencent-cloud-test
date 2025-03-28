import type { NextApiResponse } from "next";
import { createRouter } from "next-connect";
import connectToMongoDbDev from "@/lib/mongodb/client";
import * as response from "@/lib/response/response";
import { mustAuthInterceptor, UserContextRequest } from "@/lib/middleware/auth";
import logger from "@/lib/logger/winstonLogger";
import { constructQuest } from "@/lib/quests/constructor";
import { redis } from "@/lib/redis/client";
import * as Sentry from "@sentry/nextjs";
import { errorInterceptor } from "@/lib/middleware/error";
import { timeoutInterceptor } from "@/lib/middleware/timeout";
import Campaign from "@/lib/models/Campaign";
import QuestAchievement from "@/lib/models/QuestAchievement";
import CampaignAchievement from "@/lib/models/CampaignAchievement";
import { QuestType } from "@/lib/quests/types";

const router = createRouter<UserContextRequest, NextApiResponse>();


const defaultErrorResponse = response.success({
    verified: false,
    tip: "Network busy, please try again later.",
})

router.use(errorInterceptor(defaultErrorResponse), mustAuthInterceptor, timeoutInterceptor(defaultErrorResponse, 15000)).post(async (req, res) => {
    const { campaign_id, task_id } = req.body;
    if (!campaign_id || !task_id) {
        return res.json(response.invalidParams());
    }
    const userId = req.userId!;
    // 查询活动
    const campaign = await Campaign.findOne({ id: campaign_id, active: true, deleted_time: null }, {
        _id: 0,
        description: 0
    });
    if (!campaign) {
        return res.json(response.notFound("Unknown campaign."));
    }
    // 活动当前必须在进行中才可
    const now = Date.now();
    if (campaign.start_time > now || campaign.end_time <= now) {
        return res.json(response.notFound("Campaign not ongoing."));
    }
    // 查找当前的任务
    const tasks = campaign.tasks;
    let task: any;
    for (const t of tasks) {
        if (t.id == task_id) {
            task = t;
            break;
        }
    }
    if (!task) {
        return res.json(response.notFound("Unknown task."));
    }
    const questImpl = await constructQuest(task);
    // 检查用户是否已经完成该任务
    const achievement = await QuestAchievement.findOne({ user_id: userId, quest_id: task.id });
    if (achievement && achievement.verified_time) {
        logger.warn(`user ${userId} duplicate verify task ${task_id}`);
        return res.json(response.success({
            verified: false,
        }));
    }
    const lockKey = `verify_campaign_task_lock:${campaign_id}:${task_id}:${userId}`;
    // 普通任务每隔30秒允许校验一次相同任务,QuestType.TweetInteraction和QuestType.TwitterTopic为3分钟
    let interval: number = 30;
    if (task.type === QuestType.TweetInteraction || task.type === QuestType.TwitterTopic) {
        interval = 3 * 60;
    }
    const locked = await redis.set(lockKey, Date.now(), "EX", interval, "NX");
    if (!locked) {
        return res.json(response.success({
            verified: false,
            tip: `Verification is under a ${interval}s waiting period, please try again later.`,
        }));
    }
    // 检查用户是否已经完成任务
    const result = await questImpl.checkClaimable(userId);
    if (!result.claimable) {
        return res.json(response.success({
            verified: result.tip ? result.tip.indexOf("progress") > -1 : false,
            require_authorization: result.require_authorization,
            tip: result.tip,
        }));
    }
    // 用户已完成任务，添加完成标识.
    await questImpl.addUserAchievement(userId, true);
    await try2AddUserCampaignAchievement(userId, campaign_id, tasks.map((t: any) => t.id));
    // 检查用户是否已经完成所有任务
    return res.json(response.success({
        verified: true,
    }));
});

async function try2AddUserCampaignAchievement(userId: string, campaignId: string, taskIds: string[]) {
    try {
        // 检查用户是否已经完成了所有的任务
        const achievements = await QuestAchievement.find({ user_id: userId, quest_id: { $in: taskIds } }, {
            _id: 0,
            quest_id: 1
        });
        if (achievements.length != taskIds.length) {
            // 用户还未完成所有任务
            return;
        }
        // 用户已经完成了所有任务，添加活动达成记录
        await CampaignAchievement.updateOne({ user_id: userId, campaign_id: campaignId }, {
            $setOnInsert: { created_time: Date.now() },
        }, { upsert: true });
    } catch (e) {
        logger.error(e);
        Sentry.captureException(e);
    }
}


// this will run if none of the above matches
router.all((req, res) => {
  if (req.method === 'OPTIONS') {
    return res.status(204).end(); // 预检请求返回 204，避免 GET 触发错误
  }
    res.status(405).json({
        error: "Method not allowed",
    });
});

export default router.handler();