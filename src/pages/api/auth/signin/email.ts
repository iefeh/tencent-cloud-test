import * as response from '../../../../lib/response/response';
import {NextApiResponse, NextApiRequest} from 'next'
import {redis} from '@/lib/redis/client';
import User from "@/lib/models/User";
import {v4 as uuidv4} from 'uuid';
import connectMongo from "@/lib/mongodb/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
        console.log(captcha, historyCaptcha);
        res.json(response.captchaMismatch());
        return
    }
    // 执行用户登录
    try {
        await connectMongo();
        let user = await User.findOne({'email': email})
        if (!user) {
            user = new User({
                user_id: uuidv4(),
                email: email,
                created_time: Date.now(),
            });
            await user.save();
        }
        // 删除验证码
        await redis.del(`login_captcha:${email}`);
        // 生成登录token
        const token = uuidv4();
        await redis.setex(`user_session:${token}`, 60 * 60 * 15, user.user_id);
        res.json(response.success({
            token: token,
        }));
    } catch (e) {
        console.error(e);
        res.json(response.serverError());
    }
}