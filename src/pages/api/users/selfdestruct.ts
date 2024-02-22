import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import connectToMongoDbDev from "@/lib/mongodb/client";
import * as response from "@/lib/response/response";
import User from "@/lib/models/User";
import UserGoogle from "@/lib/models/UserGoogle";
import {mustAuthInterceptor, UserContextRequest} from "@/lib/middleware/auth";
import UserTwitter from "@/lib/models/UserTwitter";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(mustAuthInterceptor).get(async (req, res) => {
    const userId = req.userId;
    const user = await User.findOne({'user_id': userId, 'deleted_time': null}, {_id: 0, __v: 0})
    if (!user) {
        res.status(200).json(response.notFound("Account not found"));
        return;
    }
    if (user.selfdestruct_request_time) {
        res.status(200).json(response.success());
        return;
    }
    await User.updateOne({'user_id': userId}, {'selfdestruct_request_time': Date.now()});
    res.status(200).json(response.success());
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