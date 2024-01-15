import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import * as response from "@/lib/response/response";
import {mustAuthInterceptor, UserContextRequest} from "@/lib/middleware/auth";
import {queryUser} from "@/lib/common/user";
import User from "@/lib/models/User";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(mustAuthInterceptor).post(async (req, res) => {
    const {username, avatar_url} = req.body;
    if (!username || !avatar_url) {
        return res.json(response.invalidParams());
    }
    if (typeof username !== 'string' || typeof avatar_url !== 'string') {
        return res.json(response.invalidParams());
    }
    if (username.length > 16) {
        return res.json(response.usernameTooLong());
    }
    await User.updateOne({user_id: req.userId!}, {username: username, avatar_url: avatar_url});
    return res.json(response.success());
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