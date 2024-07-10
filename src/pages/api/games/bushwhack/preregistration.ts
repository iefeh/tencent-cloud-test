import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import * as response from "@/lib/response/response";
import {maybeAuthInterceptor, UserContextRequest} from "@/lib/middleware/auth";
import {redis} from "@/lib/redis/client";
import UserMetrics from "@/lib/models/UserMetrics";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(maybeAuthInterceptor).get(async (req, res) => {
    // 查询当前预约人数
    const totalCount = await redis.get(`bushwhack_preregistration_count`);
    // 用户预约的情况.
    let preRegistered = false;
    if (req.userId) {
        const userMetric = await UserMetrics.findOne({user_id: req.userId!}, {
            _id: 0,
            pre_register_bushwhack: 1,
        });
        preRegistered = !!userMetric?.pre_register_bushwhack || false;
    }

    res.json(response.success({
        total: totalCount,
        preregistered: preRegistered,
    }));
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