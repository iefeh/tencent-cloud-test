import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import * as response from "@/lib/response/response";
import {mustAuthInterceptor, UserContextRequest} from "@/lib/middleware/auth";
import getMongoConnection from "@/lib/mongodb/client";
import Campaign from "@/lib/models/Campaign";
import {constructQuest} from "@/lib/quests/constructor";
import logger from "@/lib/logger/winstonLogger";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(mustAuthInterceptor).post(async (req, res) => {
    const {campaign_id, task_id} = req.body;
    if (!campaign_id || !task_id) {
        return res.json(response.invalidParams());
    }
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
    // 某些任务需要执行上报就可以完成对应任务，检查任务是否属于预备类
    const questImpl = constructQuest(task);
    if (!questImpl.isPrepared()) {
        logger.warn(`user ${req.userId} preparing none-prepared quest ${task_id}`);
        return res.json(response.success());
    }
    // 任务属于预备类，直接添加当前用户完成任务标识
    await questImpl.addUserAchievement(req.userId!, false);
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