import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import * as response from "@/lib/response/response";
import {mustAuthInterceptor, UserContextRequest} from "@/lib/middleware/auth";
import {redis} from "@/lib/redis/client";
import {AuthorizationType} from "@/lib/authorization/types";
import connectToMongoDbDev from "@/lib/mongodb/client";
import User from "@/lib/models/User";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(mustAuthInterceptor).post(async (req, res) => {
    res.json(response.invalidParams('Disconnection is unavailable.'));
    return;
    // 检查用户的绑定
    const user = await User.findOne({user_id: req.userId!, deleted_time: null}, {_id: 0, email: 1});
    if (!user || !user.email) {
        res.json(response.success());
        return;
    }
    await User.updateOne({user_id: req.userId!}, {$unset: {email: ""}});
    // 添加cd
    await redis.set(`reconnect_cd:${AuthorizationType.Email}:${String(user.email).toLowerCase()}`, Date.now() + 12 * 60 * 60 * 1000, "EX", 12 * 60 * 60);
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