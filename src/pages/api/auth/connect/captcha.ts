import * as response from '../../../../lib/response/response';
import {NextApiResponse, NextApiRequest} from 'next'
import {createRouter} from "next-connect";
import {mustAuthInterceptor, UserContextRequest} from "@/lib/middleware/auth";
import {sendCaptcha} from "@/lib/authorization/captcha";
import {CaptchaType} from "@/lib/authorization/types";
import User from "@/lib/models/User";
import getMongoConnection from "@/lib/mongodb/client";


const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(mustAuthInterceptor).get(async (req, res) => {
    // 检查邮件是否绑定
    const {email} = req.query;
    if (email) {
        await getMongoConnection();
        const user = await User.findOne({user_id: req.userId!, deleted_time: null}, {_id: 0, email: 1});
        if (user && user.email) {
            res.json(response.accountAlreadyBoundMedia());
            return
        }
        const other = await User.findOne({email: email, deleted_time: null}, {_id: 0, email: 1});
        if (other && other.email) {
            res.json(response.emailAlreadyBoundToOthers());
            return
        }
    }
    await sendCaptcha(CaptchaType.ConnectCaptcha, req, res);
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
        res.json(response.serverError());
    },
});