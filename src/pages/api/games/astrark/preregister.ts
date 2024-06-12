import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import connectToMongoDbDev from "@/lib/mongodb/client";
import * as response from "@/lib/response/response";
import {mustAuthInterceptor, UserContextRequest} from "@/lib/middleware/auth";
import {createUserMetric, Metric} from "@/lib/models/UserMetrics";
import {redis} from "@/lib/redis/client";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(mustAuthInterceptor).post(async (req, res) => {
    const result = await createUserMetric(req.userId!, Metric.PreRegisterAstrArk, 1);
    // 添加预约人数缓存
    if (result.modifiedCount > 0) {
        await redis.incr(`astrark_preregistration_count`);
    }
    
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