import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import getMongoConnection from "@/lib/mongodb/client";
import * as response from "@/lib/response/response";
import {mustAuthInterceptor, UserContextRequest} from "@/lib/middleware/auth";
import logger from "@/lib/logger/winstonLogger";
import {redis} from "@/lib/redis/client";
import * as Sentry from "@sentry/nextjs";
import {errorInterceptor} from "@/lib/middleware/error";
import {timeoutInterceptor} from "@/lib/middleware/timeout";
import Campaign from "@/lib/models/Campaign";
import QuestAchievement from "@/lib/models/QuestAchievement";

const router = createRouter<UserContextRequest, NextApiResponse>();


const defaultErrorResponse = response.success({
    verified: false,
    tip: "Network busy, please try again later.",
})

router.use(errorInterceptor(defaultErrorResponse), mustAuthInterceptor, timeoutInterceptor(defaultErrorResponse, 15000)).post(async (req, res) => {
    const {campaign_id} = req.body;
    if (!campaign_id) {
        return res.json(response.invalidParams());
    }
    const userId = req.userId!;
    await getMongoConnection();
    // 查询活动
    const campaign = await Campaign.findOne({id: campaign_id, active: true, deleted_time: null}, {
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
    // 检查所有的任务完成情况
    const tasks = campaign.tasks;
    const taskIds = tasks.map((t: any) => t.id);
    const questAchievements = await QuestAchievement.find({user_id: userId, quest_id: {$in: taskIds}}, {
        _id: 0,
        quest_id: 1
    });
    if (questAchievements.length != taskIds.length) {
        return res.json(response.success({
            claimed: false,
            tip: "Please complete all tasks first.",
        }));
    }
    // 用户已经完成了所有任务，计算任务奖励
    const lockKey = `claim_campaign_reward_lock:${campaign_id}:${userId}`;
    try {
        // 尝试设置任务锁
        const locked = await redis.set(lockKey, Date.now(), "EX", 30, "NX");
        if (!locked) {
            return res.json(response.success({
                claimed: false,
                tip: "Verification is under a 30s waiting period, please try again later.",
            }));
        }
        // 计算活动的MB奖励

        // 检查用户是否已经完成所有任务
        res.json(response.success({
            claimed: true,
            tip: "You have claimed rewards.",
        }));
    } catch (error) {
        logger.error(error);
        Sentry.captureException(error);
        res.status(500).json(defaultErrorResponse);
    }
});


// this will run if none of the above matches
router.all((req, res) => {
    res.status(405).json({
        error: "Method not allowed",
    });
});

export default router.handler();