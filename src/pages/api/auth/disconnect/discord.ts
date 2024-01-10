import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import * as response from "@/lib/response/response";
import {mustAuthInterceptor, UserContextRequest} from "@/lib/middleware/auth";
import {redis} from "@/lib/redis/client";
import {AuthorizationType} from "@/lib/authorization/types";
import UserDiscord from "@/lib/models/UserDiscord";
import getMongoConnection from "@/lib/mongodb/client";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(mustAuthInterceptor).post(async (req, res) => {
    await getMongoConnection();
    // 检查用户的绑定
    const discord = await UserDiscord.findOne({user_id: req.userId!, deleted_time: null});
    if (!discord) {
        res.json(response.success());
        return;
    }
    await UserDiscord.updateOne({user_id: req.userId!, deleted_time: null}, {deleted_time: Date.now()});
    // 添加cd
    await redis.set(`reconnect_cd:${AuthorizationType.Discord}:${discord.discord_id}`, Date.now() + 12 * 60 * 60 * 1000, "EX", 12 * 60 * 60);
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