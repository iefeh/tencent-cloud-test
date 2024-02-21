import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import * as response from "@/lib/response/response";
import {mustAuthInterceptor, UserContextRequest} from "@/lib/middleware/auth";
import connectToMongoDbDev from "@/lib/mongodb/client";
import {generateAuthorizationURL} from "@/lib/authorization/provider/steam";
import UserSteam from "@/lib/models/UserSteam";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(mustAuthInterceptor).get(async (req, res) => {
    // 检查用户是否已经绑定，不允许重复绑定
    const twitterAuth = await UserSteam.findOne({user_id: req.userId, deleted_time: null});
    if (twitterAuth) {
        res.json(response.accountAlreadyBoundMedia());
        return;
    }
    await generateAuthorizationURL(req, res);
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