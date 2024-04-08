import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import connectToMongoDbDev from "@/lib/mongodb/client";
import * as response from "@/lib/response/response";
import {mustAuthInterceptor, UserContextRequest} from "@/lib/middleware/auth";
import Quest from "@/lib/models/Quest";
import logger from "@/lib/logger/winstonLogger";
import {redis} from "@/lib/redis/client";
import {QuestType} from "@/lib/quests/types";
import QuestAchievement from "@/lib/models/QuestAchievement";
import {ConnectWalletQuest} from "@/lib/quests/implementations/connectWalletQuest";
import * as Sentry from "@sentry/nextjs";
import {addWalletVerificationCDForIP, checkWalletVerificationCDForIP} from "@/lib/redis/verifyWallet";
import {errorInterceptor} from "@/lib/middleware/error";
import {timeoutInterceptor} from "@/lib/middleware/timeout";
import {try2AddUser2MBLeaderboard} from "@/lib/redis/moonBeamLeaderboard";

const router = createRouter<UserContextRequest, NextApiResponse>();

const defaultErrorResponse = response.success({
    verified: false,
    tip: "Network busy, please try again later.",
})

router.use(errorInterceptor(defaultErrorResponse), mustAuthInterceptor, timeoutInterceptor(defaultErrorResponse, 15000)).post(async (req, res) => {
    const {quest_id} = req.body;
    if (!quest_id) {
        res.json(response.invalidParams());
        return;
    }
    const quest = await Quest.findOne({id: quest_id, active: true, deleted_time: null});
    if (!quest) {
        res.json(response.notFound("Unknown quest."));
        return;
    }
    try {
        switch (quest.type) {
            case QuestType.ConnectWallet:
                await reverifyConnectWallet(quest, req, res);
                return;
            default:
                res.json(response.invalidParams("Quest does not support reverification."));
                return;
        }
    } catch (error) {
        logger.error(error);
        Sentry.captureException(error);
        res.json(response.success(defaultErrorResponse));
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
    // 每隔30秒允许校验一次相同任务
    const locked = await redis.set(lockKey, Date.now(), "EX", 30, "NX");
    if (!locked) {
        logger.warn(`user ${userId} reverifying quest ${quest.id} when cooling down.`);
        res.json(response.success({
            verified: false,
            tip: "Verify cooling down, please try again later.",
        }));
        return;
    }
    // 钱包资产任务需要额外检查CD
    const verifiable = await checkWalletVerificationCDForIP(req, res);
    if (!verifiable) {
        return;
    }
    // 尝试领取奖励
    const questImpl = new ConnectWalletQuest(quest);
    const result = await questImpl.reClaimReward(userId);
    // 刷新MB缓存
    if (result.claimed_amount && result.claimed_amount > 0) {
        await try2AddUser2MBLeaderboard(userId);
    }
    if (result.claimed_amount != undefined && quest.type == QuestType.ConnectWallet) {
        // 钱包资产任务添加检查CD
        await addWalletVerificationCDForIP(req);
    }
    res.json(response.success(result));
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