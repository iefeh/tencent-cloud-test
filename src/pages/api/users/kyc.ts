import type { NextApiResponse } from "next";
import { createRouter } from "next-connect";
import * as response from "@/lib/response/response";
import { mustAuthInterceptor, UserContextRequest } from "@/lib/middleware/auth";
import { redis } from "@/lib/redis/client";
import UserMetrics from "@/lib/models/UserMetrics";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(mustAuthInterceptor).post(async (req, res) => {
    let { period } = req.body;
    const userId = req.userId!;

    let data = { is_alert: false };
    const cachedKey = `kyc:${userId}`;
    const ok: any = await redis.get(cachedKey);
    if (ok) {
        return res.json(response.success(data));
    }

    const delayingKey = `kyc-delaying:${userId}`;
    const delaying = await redis.get(delayingKey); 
    if (delaying) {
        return res.json(response.success(data));
    }

    const userMetric = await UserMetrics.findOne({ user_id: userId }); 
    if (userMetric && (userMetric.twitter_followed_astrark == 1)
        && userMetric.twitter_followed_moonveil == 1
        && userMetric.discord_joined_moonveil == 1
        && userMetric.discord_connected == 1
        && (userMetric.twitter_connected == 1 || userMetric.twitter_connected == true)) {
        await redis.set(cachedKey, '1');
        return res.json(response.success(data));
    }
    
    if (!period || typeof period !== 'number') {
        period = 1;// 默认延后1小时
    }
    
    if (Number(period) > 0 && Number(period) <= 24) {
        await redis.setex(delayingKey, Number(period) * 60 * 60, '1');// 一定时间后后再提醒
    }

    data.is_alert = true;
    return res.json(response.success(data));
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