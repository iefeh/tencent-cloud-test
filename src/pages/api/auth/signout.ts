import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import * as response from "@/lib/response/response";
import {redis} from "@/lib/redis/client";
import {mustAuthInterceptor, UserContextRequest} from "@/lib/middleware/auth";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(mustAuthInterceptor).post(async (req, res) => {
    const token = req.headers.authorization;
    await redis.del(`user_session:${token}`);
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
        res.status(500).json(response.serverError());
    },
});