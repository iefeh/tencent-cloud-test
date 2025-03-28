import type { NextApiResponse } from "next";
import { createRouter } from "next-connect";
import connectToMongoDbDev from "@/lib/mongodb/client";
import * as response from "@/lib/response/response";
import { mustAuthInterceptor, UserContextRequest } from "@/lib/middleware/auth";
import Quest from "@/lib/models/Quest";
import logger from "@/lib/logger/winstonLogger";
import { constructQuest } from "@/lib/quests/constructor";
import { redis } from "@/lib/redis/client";
import { try2AddUsers2MBLeaderboard } from "@/lib/redis/moonBeamLeaderboard";
import * as Sentry from "@sentry/nextjs";
import { errorInterceptor } from "@/lib/middleware/error";
import { timeoutInterceptor } from "@/lib/middleware/timeout";
import { QuestType } from "@/lib/quests/types";
import { addWalletVerificationCDForIP, checkWalletVerificationCDForIP } from "@/lib/redis/verifyWallet";
import { updateUserBattlepass } from "@/lib/battlepass/battlepass"

const router = createRouter<UserContextRequest, NextApiResponse>();


const defaultErrorResponse = response.success({
    verified: false,
    tip: "Network busy, please try again later.",
})

router.use(errorInterceptor(defaultErrorResponse), mustAuthInterceptor, timeoutInterceptor(defaultErrorResponse, 15000)).post(async (req, res) => {
    const { quest_id, tx_hash } = req.body;
    if (!quest_id) {
        res.json(response.invalidParams());
        return;
    }
    const quest = await Quest.findOne({ id: quest_id, active: true, deleted_time: null });
    if (!quest) {
        res.json(response.notFound("Unknown quest."));
        return;
    }
    const now = Date.now();
    if (quest.start_time > now || quest.end_time <= now || (quest.reward.verify_end_time && quest.reward.verify_end_time <= now)) {
        res.json(response.success({
            verified: false,
            tip: "Quest is not available.",
        }));
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
        // 普通任务每隔30秒允许校验一次相同任务,QuestType.TweetInteraction为3分钟
        let interval: number = 30;
        if (quest.type === QuestType.TweetInteraction || quest.type === QuestType.TwitterTopic) {
            interval = 3 * 60;
        }
        const locked = await redis.set(lockKey, Date.now(), "EX", interval, "NX");
        if (!locked) {
            res.json(response.success({
                verified: false,
                tip: `Verification is under a ${interval}s waiting period, please try again later.`,
            }));
            return;
        }

        if (tx_hash) {// 如果有tx_hash则进行缓存
            const txHashCachedKey = `tx_hash_cached_key:${userId},${quest.id}`
            await redis.setex(txHashCachedKey, 30, tx_hash);// 缓存30s
        }

        // 钱包资产任务需要额外检查CD
        if (quest.type == QuestType.ConnectWallet) {
            const verifiable = await checkWalletVerificationCDForIP(req, res);
            if (!verifiable) {
                return;
            }
        }
        // 申领任务奖励
        const result = await questImpl.claimReward(userId);
        if (result.claimed_amount && result.claimed_amount > 0) {
            await try2AddUsers2MBLeaderboard(userId);
            await updateUserBattlepass(userId, quest_id, result.claimed_amount, undefined);
        }
        if (result.claimed_amount != undefined && quest.type == QuestType.ConnectWallet) {
            // 钱包资产任务添加检查CD
            await addWalletVerificationCDForIP(req);
        }

        res.json(response.success(result));
    } catch (error) {
        logger.error(error);
        Sentry.captureException(error);
        res.status(500).json(defaultErrorResponse);
    }
});


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