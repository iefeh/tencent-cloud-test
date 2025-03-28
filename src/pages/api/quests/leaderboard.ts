import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import connectToMongoDbDev from "@/lib/mongodb/client";
import * as response from "@/lib/response/response";
import {maybeAuthInterceptor, UserContextRequest} from "@/lib/middleware/auth";
import {getMBLeaderboardTopUsers} from "@/lib/redis/moonBeamLeaderboard";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(maybeAuthInterceptor).get(async (req, res) => {
    const userId = req.userId;
    const leaderboard = await getMBLeaderboardTopUsers(userId!);
    res.json(response.success(leaderboard));
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