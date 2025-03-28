import * as response from '../../../../lib/response/response';
import {NextApiResponse, NextApiRequest} from 'next'
import {redis} from '@/lib/redis/client';
import User from "@/lib/models/User";
import connectToMongoDbDev, {isDuplicateKeyError} from "@/lib/mongodb/client";
import {createRouter} from "next-connect";
import {CaptchaType} from "@/lib/authorization/types";
import {mustAuthInterceptor, UserContextRequest} from "@/lib/middleware/auth";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(mustAuthInterceptor).post(async (req, res) => {
    // 校验验证码
    const {email, captcha} = req.body;
    if (!email || !captcha) {
        res.json(response.invalidParams());
        return
    }
    let lCaseEmail = String(email).toLowerCase()
    const historyCaptcha = await redis.get(`${CaptchaType.ConnectCaptcha}:${lCaseEmail}`);
    if (!historyCaptcha) {
        res.json(response.captchaExpired());
        return
    }
    if (historyCaptcha != captcha) {
        res.json(response.captchaMismatch());
        return
    }
    // 检查当前账户是否已经存在邮件
    const user = await User.findOne({user_id: req.userId!, deleted_time: null}, {_id: 0, email: 1});
    if (user && user.email) {
        res.json(response.accountAlreadyBoundMedia());
        return
    }
    // 执行用户邮件绑定、删除验证码
    try {
        await User.updateOne({'user_id': req.userId, email: null}, {email: lCaseEmail});
        await redis.del(`${CaptchaType.ConnectCaptcha}:${lCaseEmail}`);
    } catch (e) {
        if (isDuplicateKeyError(e)) {
            res.json(response.emailAlreadyBoundToOthers());
            return
        }
        throw e;
    }
    res.json(response.success());
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