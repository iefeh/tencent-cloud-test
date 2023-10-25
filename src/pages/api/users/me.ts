import type {NextApiRequest, NextApiResponse} from "next";
import {createRouter} from "next-connect";
import connectMongo from "@/lib/mongodb/client";
import * as response from "@/lib/response/response";
import {redis} from "@/lib/redis/client";
import User from "@/lib/models/User";
import UserGoogle from "@/lib/models/UserGoogle";

const router = createRouter<NextApiRequest, NextApiResponse>();

router.get(async (req, res) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
        res.json(response.unauthorized());
        return;
    }
    const userId = await redis.get(`user_session:${authorization}`);
    if (!userId) {
        res.json(response.unauthorized());
        return;
    }

    await connectMongo();
    const user = await User.findOne({'user_id': userId}, {_id: 0, __v: 0})
    const google = await UserGoogle.findOne({'user_id': userId, 'deleted_time': null}, {_id: 0, __v: 0})
    const entity = user.toObject();
    entity.google = google;
    res.json(response.success(entity));
});

// this will run if none of the above matches
router.all((req, res) => {
    res.status(405).json({
        error: "Method not allowed",
    });
});

export default router.handler({
    onError(err, req, res) {
        res.status(400).json({
            error: (err as Error).message,
        });
    },
});