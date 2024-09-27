import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import * as response from "@/lib/response/response";
import {mustAuthInterceptor, UserContextRequest} from "@/lib/middleware/auth";
import {redis} from "@/lib/redis/client";
import {AuthorizationType} from "@/lib/authorization/types";
import UserSteam from "@/lib/models/UserSteam";
import doTransaction from "@/lib/mongodb/transaction";
import UserMetrics, { Metric } from "@/lib/models/UserMetrics";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(mustAuthInterceptor).post(async (req, res) => {
    res.json(response.invalidParams('Disconnection is unavailable.'));
    return;
    // 检查用户的绑定
    const steam = await UserSteam.findOne({user_id: req.userId!, deleted_time: null});
    if (!steam) {
        res.json(response.success());
        return;
    }
    await doTransaction(async (session) => {
        const opts = {session};
        await UserSteam.updateOne({user_id: req.userId!, deleted_time: null}, {deleted_time: Date.now()}, opts);
        // 更新用户授权指标
        await UserMetrics.updateOne({user_id: req.userId},{[Metric.SteamConnected]: 0},opts);
    });
    // 添加cd
    await redis.set(`reconnect_cd:${AuthorizationType.Steam}:${steam.steam_id}`, Date.now() + 12 * 60 * 60 * 1000, "EX", 12 * 60 * 60);
    res.json(response.success());
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