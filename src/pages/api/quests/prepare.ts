import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import * as response from "@/lib/response/response";
import {mustAuthInterceptor, UserContextRequest} from "@/lib/middleware/auth";
import getMongoConnection from "@/lib/mongodb/client";
import Quest from "@/lib/models/Quest";
import {preparedQuests} from "@/lib/quests/types";
import logger from "@/lib/logger/winstonLogger";
import QuestAchievement from "@/lib/models/QuestAchievement";
import UserMetrics from "@/lib/models/UserMetrics";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(mustAuthInterceptor).post(async (req, res) => {
    const {quest_id} = req.body;
    if (!quest_id) {
        res.json(response.invalidParams());
        return;
    }
    const userId = req.userId!;
    await getMongoConnection();
    const quest = await Quest.findOne({id: quest_id, active: true, deleted_time: null});
    if (!quest) {
        res.json(response.notFound("Unknown quest."));
        return;
    }
    // 某些任务需要执行上报就可以完成对应任务，检查任务是否属于预备类
    const prepared = preparedQuests.get(quest.type);
    if (!prepared) {
        logger.warn(`user ${req.userId} preparing none-prepared quest ${quest_id}`);
        return res.json(response.success());
    }
    // 任务属于预备类，直接添加当前用户完成任务标识
    await QuestAchievement.updateOne({user_id: userId, quest_id: quest_id}, {
        $setOnInsert: {created_time: Date.now()},
    }, {upsert: true});
    return res.json(response.success());
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