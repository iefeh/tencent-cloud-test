import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import getMongoConnection from "@/lib/mongodb/client";
import * as response from "@/lib/response/response";
import {mustAuthInterceptor, UserContextRequest} from "@/lib/middleware/auth";
import Quest from "@/lib/models/Quest";
import logger from "@/lib/logger/winstonLogger";
import {claimQuestReward} from "@/lib/quests/claim";
import {ConnectDiscordQuest} from "@/lib/quests/implementations/connectDiscordQuest";
import {redis} from "@/lib/redis/client";

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
    const userId = req.userId!;
    // 检查用户是否已经完成该任务, 注意此处使用的是ConnectDiscordQuest，但我们实际是为了使用他基类的方法
    const verified = await new ConnectDiscordQuest(quest).checkVerified(userId);
    if (verified) {
        logger.warn(`user ${userId} duplicate verify quest ${quest_id}`);
        res.json(response.success({
            verified: true,
        }));
        return;
    }
    const lockKey = `claim_quest_lock:${quest_id}:${userId}`;
    try {
        // 每隔10秒允许校验一次相同任务
        const locked = await redis.set(lockKey, Date.now(), "EX", 10, "NX");
        if (!locked) {
            res.json(response.success({
                verified: false,
                tip: "Network busy, please try again later.",
            }));
            return;
        }
        // 申领任务奖励
        const result = await claimQuestReward(userId, quest);
        res.json(response.success(result));
    } catch (error) {
        console.error(error);
        res.json(response.success({
            verified: false,
            tip: "Network busy, please try again later.",
        }));
    }
    // finally {
    //     await redis.del(lockKey);
    // }
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