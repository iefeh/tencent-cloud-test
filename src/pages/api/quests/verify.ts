import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import getMongoConnection from "@/lib/mongodb/client";
import * as response from "@/lib/response/response";
import User from "@/lib/models/User";
import UserGoogle from "@/lib/models/UserGoogle";
import {mustAuthInterceptor, UserContextRequest} from "@/lib/middleware/auth";
import UserTwitter from "@/lib/models/UserTwitter";
import Quest from "@/lib/models/Quest";
import {notFound} from "@/lib/response/response";
import QuestAchievement from "@/lib/models/QuestAchievement";
import logger from "@/lib/logger/winstonLogger";
import {checkUserQuestClaimable} from "@/lib/quests/verification";

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
    // 检查用户是否已经完成该任务
    const userId = req.userId!;
    const achievement = await QuestAchievement.findOne({user_id: userId, quest_id: quest_id});
    if (achievement) {
        logger.warn(`user ${userId} duplicate verify quest ${quest_id}`);
        res.json(response.success({
            verified: true,
        }));
        return;
    }
    // 检查用户是否完成任务，与用户获取的经验
    await getMongoConnection();
    const verifyQuestResult = await checkUserQuestClaimable(userId, quest);
    if (!verifyQuestResult.claimable) {
        res.json(response.success({
            verified: verifyQuestResult.claimable,
            require_authorization: verifyQuestResult.require_authorization,
        }));
        return;
    }
    res.json(response.success({}));
});

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