import * as response from '../../../../lib/response/response';
import {NextApiResponse, NextApiRequest} from 'next'
import {redis} from '@/lib/redis/client';
import User from "@/lib/models/User";
import {v4 as uuidv4} from 'uuid';
import getMongoConnection from "@/lib/mongodb/client";
import {createRouter} from "next-connect";
import {generateUserSession} from "@/lib/middleware/session";
import {genLoginJWT} from "@/lib/particle.network/auth";

const router = createRouter<NextApiRequest, NextApiResponse>();

router.post(async (req, res) => {
    // 校验验证码
    const {email, captcha} = req.body;
    if (!email || !captcha) {
        res.json(response.invalidParams());
        return
    }
    const historyCaptcha = await redis.get(`login_captcha:${email}`);
    if (!historyCaptcha) {
        res.json(response.captchaExpired());
        return
    }
    if (historyCaptcha != captcha) {
        res.json(response.captchaMismatch());
        return
    }
    // 执行用户登录
    await getMongoConnection();
    let user = await User.findOne({'email': email})
    if (!user) {
        user = new User({
            user_id: uuidv4(),
            email: email,
            username: email.split("@")[0],
            avatar_url: process.env.DEFAULT_AVATAR_URL,
            created_time: Date.now(),
        });
        await user.save();
    }
    // 删除验证码
    await redis.del(`login_captcha:${email}`);
    // 生成登录token
    const token = await generateUserSession(user.user_id);
    res.json(response.success({
        token: token,
        particle_jwt: genLoginJWT(user.user_id),
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