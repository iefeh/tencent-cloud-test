import type { NextApiResponse } from "next";
import { createRouter } from "next-connect";
import * as response from "@/lib/response/response";
import { mustAuthInterceptor, UserContextRequest } from "@/lib/middleware/auth";
import logger from "@/lib/logger/winstonLogger";
import { redis } from "@/lib/redis/client";
import { try2AddUsers2MBLeaderboard } from "@/lib/redis/moonBeamLeaderboard";
import * as Sentry from "@sentry/nextjs";
import { errorInterceptor } from "@/lib/middleware/error";
import UserTwitter from "@/lib/models/UserTwitter";
import { AuthorizationType } from "@/lib/authorization/types";
import UserMoonBeamAudit, { UserMoonBeamAuditType } from "@/lib/models/UserMoonBeamAudit";
import doTransaction from "@/lib/mongodb/transaction";
import User from "@/lib/models/User";

const router = createRouter<UserContextRequest, NextApiResponse>();

const defaultErrorResponse = response.success({
    verified: false,
    tip: "Network busy, please try again later.",
})

router.use(errorInterceptor(defaultErrorResponse), mustAuthInterceptor).get(async (req, res) => {
    const userId = req.userId!;

    const lockKey = `claim_bushwhack_lock:${userId}`;
    try {
        let interval: number = 30;
        const locked = await redis.set(lockKey, Date.now(), "EX", interval, "NX");
        if (!locked) {
            res.json(response.success({
                verified: false,
                tip: `Claiming is under a ${interval}s waiting period, please try again later.`,
            }));
            return;
        }

        // 查询用户是否绑定twitter.
        const userTwitter = await UserTwitter.findOne({ user_id: userId, deleted_time: null });
        if (!userTwitter) {
            return {
                claimable: false,
                require_authorization: AuthorizationType.Twitter,
            }
        }

        // 查询是否已领取分享BushWhack奖励
        const taint = `share_bushwhack:${userId},${userTwitter.twitter_id}`;
        const mb = await UserMoonBeamAudit.findOne({ reward_taint: taint });
        if (mb) {
            res.json(response.success({
                verified: false,
                tip: "The user has already claimed reward.",
            }));
            return;
        }

        // 保存奖励
        const audit = new UserMoonBeamAudit();
        audit.user_id = userId;
        audit.type = UserMoonBeamAuditType.BushWhackShare;
        audit.moon_beam_delta = 20;
        audit.reward_taint = taint;
        audit.corr_id = userTwitter.twitter_id;
        audit.created_time = Date.now();
        await doTransaction(async (session) => {
            const opts = { session };
            await audit.save(opts);
            await User.updateOne({ user_id: userId }, { $inc: { moon_beam: audit.moon_beam_delta } }, opts);
        });

        //更新用户moonbeam数据
        await try2AddUsers2MBLeaderboard(userId);

        res.json(response.success({
            verified: true,
            tip: `You have claimed ${audit.moon_beam_delta} MBs.`
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