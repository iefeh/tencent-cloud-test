import {UserContextRequest} from "@/lib/middleware/auth";
import {NextApiResponse} from "next";
import * as response from "@/lib/response/response";
import connectToMongoDbDev from "@/lib/mongodb/client";
import Quest from "@/lib/models/Quest";
import {constructQuest} from "@/lib/quests/constructor";
import logger from "@/lib/logger/winstonLogger";

export async function prepareUserQuestAchievement(req: UserContextRequest, res: NextApiResponse, quest_id: string) {
    if (!quest_id) {
        res.json(response.invalidParams());
        return;
    }
    const userId = req.userId!;
    const quest = await Quest.findOne({id: quest_id, active: true, deleted_time: null});
    if (!quest) {
        res.json(response.notFound("Unknown quest."));
        return;
    }
    // 某些任务需要执行上报就可以完成对应任务，检查任务是否属于预备类
    const questImpl = constructQuest(quest);
    if (!questImpl.isPrepared()) {
        logger.warn(`user ${req.userId} preparing none-prepared quest ${quest_id}`);
        return res.json(response.success());
    }
    // 任务属于预备类，直接添加当前用户完成任务标识
    await questImpl.addUserAchievement(userId, false);
    return res.json(response.success());
}