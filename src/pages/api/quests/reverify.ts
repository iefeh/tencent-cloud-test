import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import getMongoConnection from "@/lib/mongodb/client";
import * as response from "@/lib/response/response";
import {mustAuthInterceptor, UserContextRequest} from "@/lib/middleware/auth";
import Quest from "@/lib/models/Quest";
import logger from "@/lib/logger/winstonLogger";
import {redis} from "@/lib/redis/client";
import {QuestType} from "@/lib/quests/types";
import {invalidParams} from "@/lib/response/response";
import QuestAchievement from "@/lib/models/QuestAchievement";
import UserMetrics, {Metric} from "@/lib/models/UserMetrics";
import {ConnectWalletQuest} from "@/lib/quests/implementations/connectWalletQuest";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(mustAuthInterceptor).post(async (req, res) => {
    const {quest_id} = req.body;
    if (!quest_id) {
        res.json(response.invalidParams());
        return;
    }
    await getMongoConnection();
    const quest = await Quest.findOne({id: quest_id});
    if (!quest) {
        res.json(response.notFound("Unknown quest."));
        return;
    }
    switch (quest.type) {
        case QuestType.ConnectWallet:
            await reverifyConnectWallet(quest, req, res);
            return;
        default:
            res.json(response.invalidParams("Quest does not support reverification."));
            return;
    }
});

async function reverifyConnectWallet(quest: any, req: any, res: any) {
    const userId = req.userId!;
    // 检查用户是否完成任务
    const achieved = await QuestAchievement.findOne({quest_id: quest.id, user_id: userId});
    if (!achieved) {
        res.json(response.invalidParams("You have not verified quest."));
        return;
    }
    const lockKey = `claim_quest_lock:${quest.id}:${userId}`;
    try {
        // 每隔10秒允许校验一次相同任务
        const locked = await redis.set(lockKey, Date.now(), "EX", 30, "NX");
        if (!locked) {
            logger.warn(`user ${userId} reverifying quest ${quest.id} when cooling down.`);
            res.json(response.success({
                verified: false,
                tip: "Verify cooling down, please try again later.",
            }));
            return;
        }
        // 尝试领取奖励
        const questImpl = new ConnectWalletQuest(quest);
        const result = await questImpl.reClaimReward(userId);
        res.json(response.success(result));
    } catch (error) {
        console.error(error);
        res.json(response.success({
            verified: false,
            tip: "Network busy, please try again later.",
        }));
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