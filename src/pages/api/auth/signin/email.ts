import * as response from '../../../../lib/response/response';
import {NextApiRequest, NextApiResponse} from 'next'
import {redis} from '@/lib/redis/client';
import User, {IUser} from "@/lib/models/User";
import {v4 as uuidv4} from 'uuid';
import connectToMongoDbDev from "@/lib/mongodb/client";
import {createRouter} from "next-connect";
import {generateUserSession, generateUserSignupSession} from "@/lib/middleware/session";
import {genLoginJWT} from "@/lib/particle.network/auth";
import {AuthorizationType, CaptchaType, SignupPayload} from "@/lib/authorization/types";
import doTransaction from "@/lib/mongodb/transaction";
import UserInvite from "@/lib/models/UserInvite";

const router = createRouter<NextApiRequest, NextApiResponse>();

router.post(async (req, res) => {
    const {email, captcha, invite_code, signup_mode} = req.body;
    if (!email || !captcha) {
        console.log("request body:", req.body);
        res.json(response.invalidParams());
        return
    }
    if (signup_mode && signup_mode !== "enabled") {
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
    if (isNewUser && signup_mode) {
        await doSignupConfirmation(res, inviter, user as IUser, email);
        return;
    }
    await doUserLogin(res, inviter, user as IUser, email);
});

async function doSignupConfirmation(res: any, inviter: IUser, user: IUser, email: string) {
    // 构建注册的负载信息
    const payload: SignupPayload = {
        authorization_type: AuthorizationType.Email,
        user: {
            user_id: uuidv4(),
            email: email,
            username: email.split("@")[0],
            avatar_url: process.env.DEFAULT_AVATAR_URL,
            created_time: Date.now(),
        }
    };
    if (inviter) {
        payload.invite = {
            user_id: inviter.user_id,
            invitee_id: user.user_id,
            created_time: Date.now(),
        };
    }
    // 删除验证码
    await redis.del(`${CaptchaType.LoginCaptcha}:${email}`);
    // 生成二次确认的注册token
    const token = await generateUserSignupSession(payload);
    res.json(response.signupConfirmation({
        signup_cred: token,
    }));
}

async function doUserLogin(res: any, inviter: IUser, user: IUser, email: string) {
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
}

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