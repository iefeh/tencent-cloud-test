import type {NextApiRequest, NextApiResponse} from "next";
import {createRouter} from "next-connect";
import connectMongo from "@/lib/mongodb/client";
import * as response from "@/lib/response/response";
import {redis} from "@/lib/redis/client";
import User from "@/lib/models/User";
import UserGoogle from "@/lib/models/UserGoogle";
import {mustAuthInterceptor, UserContextRequest} from "@/lib/middleware/auth";
import UserTwitter from "@/lib/models/UserTwitter";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(mustAuthInterceptor).get(async (req, res) => {
    const userId = req.userId;
    await connectMongo();
    const user = await User.findOne({'user_id': userId}, {_id: 0, __v: 0})
    const google = await UserGoogle.findOne({'user_id': userId, 'deleted_time': null}, {_id: 0, __v: 0})
    const twitter = await UserTwitter.findOne({'user_id': userId, 'deleted_time': null}, {_id: 0, __v: 0})
    const entity = user.toObject();
    entity.google = google;
    entity.twitter = twitter;
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
        res.status(500).json(response.serverError());
    },
});