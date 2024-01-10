import * as response from '../../../../lib/response/response';
import {NextApiResponse, NextApiRequest} from 'next'
import {redis} from '@/lib/redis/client';
import User, {IUser} from "@/lib/models/User";
import {v4 as uuidv4} from 'uuid';
import getMongoConnection from "@/lib/mongodb/client";
import {createRouter} from "next-connect";
import {generateUserSession} from "@/lib/middleware/session";
import {genLoginJWT} from "@/lib/particle.network/auth";
import {CaptchaType} from "@/lib/authorization/types";
import doTransaction from "@/lib/mongodb/transaction";
import UserInvite from "@/lib/models/UserInvite";

const router = createRouter<NextApiRequest, NextApiResponse>();

router.post(async (req, res) => {
    const {email, captcha, invite_code} = req.body;
    if (!email || !captcha) {
        res.json(response.invalidParams());
        return
    }
    // 校验验证码
    const historyCaptcha = await redis.get(`${CaptchaType.LoginCaptcha}:${email}`);
    if (!historyCaptcha) {
        res.json(response.captchaExpired());
        return
    }
    if (historyCaptcha != captcha) {
        res.json(response.captchaMismatch());
        return
    }
    // 检查邀请码
    await getMongoConnection();
    let inviter: any;
    if (invite_code) {
        inviter = await User.findOne({invite_code: invite_code}, {_id: 0, user_id: 1});
        if (!inviter) {
            res.json(response.unknownInviteCode());
            return
        }
    }
    // 执行用户登录
    let user = await User.findOne({'email': email});
    const isNewUser = !user;
    if (isNewUser) {
        user = new User({
            user_id: uuidv4(),
            email: email,
            username: email.split("@")[0],
            avatar_url: process.env.DEFAULT_AVATAR_URL,
            created_time: Date.now(),
        });
        await doTransaction(async function (session) {
            const opts = {session};
            await user.save(opts);
            if (inviter) {
                const invite = new UserInvite({
                    user_id: inviter.user_id,
                    invitee_id: user.user_id,
                    created_time: Date.now(),
                });
                await invite.save(opts);
            }
        })

    }
    // 删除验证码
    await redis.del(`${CaptchaType.LoginCaptcha}:${email}`);
    // 生成登录token
    const token = await generateUserSession(user.user_id);
    res.json(response.success({
        token: token,
        particle_jwt: genLoginJWT(user.user_id),
        is_new_user: isNewUser,
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