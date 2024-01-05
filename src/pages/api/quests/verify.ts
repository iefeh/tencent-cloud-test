import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import getMongoConnection from "@/lib/mongodb/client";
import * as response from "@/lib/response/response";
import {mustAuthInterceptor, UserContextRequest} from "@/lib/middleware/auth";
import Quest from "@/lib/models/Quest";
import logger from "@/lib/logger/winstonLogger";
import {constructQuest} from "@/lib/quests/constructor";
import {redis} from "@/lib/redis/client";
import {try2AddUser2MBLeaderboard} from "@/lib/redis/moonBeamLeaderboard";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(mustAuthInterceptor).post(async (req, res) => {
    const {quest_id} = req.body;
    if (!quest_id) {
        res.json(response.invalidParams());
        return;
    }
    await getMongoConnection();
    const quest = await Quest.findOne({id: quest_id, active: true, deleted_time: null});
    if (!quest) {
        res.json(response.notFound("Unknown quest."));
        return;
    }
    const questImpl = await constructQuest(quest);
    const userId = req.userId!;
    // 检查用户是否已经完成该任务
    const verified = await questImpl.checkVerified(userId);
    if (verified) {
        logger.warn(`user ${userId} duplicate verify quest ${quest_id}`);
        res.json(response.success({
            verified: false,
            tip: "You have already claimed quest reward.",
        }));
        return;
    }
    const lockKey = `claim_quest_lock:${quest_id}:${userId}`;
    try {
        // 每隔30秒允许校验一次相同任务
        const locked = await redis.set(lockKey, Date.now(), "EX", 30, "NX");
        if (!locked) {
            res.json(response.success({
                verified: false,
                tip: "Verify cooling down, please try again later.",
            }));
            return;
        }
        // 申领任务奖励
        const result = await questImpl.claimReward(userId);
        if (result.claimed_amount && result.claimed_amount > 0) {
            await try2AddUser2MBLeaderboard(userId);
        }
        res.json(response.success(result));
    } catch (error) {
        console.error(error);
        res.json(response.success({
            verified: false,
            tip: "Network busy, please try again later.",
        }));
    }
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