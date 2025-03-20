import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import * as response from "@/lib/response/response";
import {mustAuthInterceptor, UserContextRequest} from "@/lib/middleware/auth";
import connectToMongoDbDev from "@/lib/mongodb/client";
import UserGoogle from "@/lib/models/UserGoogle";
import {generateAuthorizationURL} from "@/lib/authorization/provider/google";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(mustAuthInterceptor).get(async (req, res) => {
    // 检查用户是否已经绑定，不允许重复绑定
    const googleAuth = await UserGoogle.findOne({user_id: req.userId, deleted_time: null});
    if (googleAuth) {
        res.json(response.accountAlreadyBoundMedia());
        return;
    }
    await generateAuthorizationURL(req, res);
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

export default router.handler({
    onError(err, req, res) {
        console.error(err);
        res.status(500).json(response.serverError());
    },
});