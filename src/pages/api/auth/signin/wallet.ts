import * as response from '../../../../lib/response/response';
import {NextApiResponse, NextApiRequest} from 'next'
import {createRouter} from "next-connect";
import {verifySignWallet} from "@/lib/web3/wallet";
import UserWallet, {IUserWallet} from "@/lib/models/UserWallet";
import {generateUserSession, generateUserSignupSession} from "@/lib/middleware/session";
import {genLoginJWT} from "@/lib/particle.network/auth";
import User, {IUser} from "@/lib/models/User";
import {v4 as uuidv4} from "uuid";
import getMongoConnection from "@/lib/mongodb/client";
import doTransaction from "@/lib/mongodb/transaction";
import UserInvite from "@/lib/models/UserInvite";
import {AuthorizationType, CaptchaType, SignupPayload} from "@/lib/authorization/types";
import {redis} from "@/lib/redis/client";

const router = createRouter<NextApiRequest, NextApiResponse>();

router.post(async (req, res) => {
    const address = verifySignWallet(req, res);
    if (!address) {
        return;
    }
    // 检查邀请码、注册模式
    const {invite_code, signup_mode} = req.body;
    if (signup_mode && signup_mode !== "enabled") {
        res.json(response.invalidParams());
        return
    }
    await getMongoConnection();
    let inviter: any;
    if (invite_code) {
        inviter = await User.findOne({invite_code: invite_code}, {_id: 0, user_id: 1});
        if (!inviter) {
            res.json(response.unknownInviteCode());
            return
        }
    }
    // 检查用户是否历史用户
    let userWallet = await UserWallet.findOne({wallet_addr: address.toLowerCase(), deleted_time: null}) as IUserWallet;
    const isNewUser = !userWallet;
    if (isNewUser && signup_mode) {
        // 执行注册确认
        await doSignupConfirmation(res, inviter, address.toLowerCase());
        return;
    }
    // 执行常规用户登录
    if (isNewUser) {
        // 用户不存在，需要创建新的用户与钱包绑定
        userWallet = await createUserAndWallet(address, inviter);
    }
    const token = await generateUserSession(userWallet.user_id);
    res.json(response.success({
        token: token,
        particle_jwt: genLoginJWT(userWallet.user_id),
        is_new_user: isNewUser,
    }));
});

async function doSignupConfirmation(res: any, address: string, inviter: any) {
    // 构建注册的负载信息
    const now = Date.now();
    const userId = uuidv4();
    const payload: SignupPayload = {
        authorization_type: AuthorizationType.Wallet,
        user: {
            user_id: userId,
            username: address,
            avatar_url: process.env.DEFAULT_AVATAR_URL,
            created_time: now,
        },
        third_party_user: {
            user_id: userId,
            wallet_addr: address.toLowerCase(),
            created_time: now,
        },
    };
    if (inviter) {
        payload.invite = {
            user_id: inviter.user_id,
            invitee_id: userId,
            created_time: now,
        };
    }
    // 生成二次确认的注册token
    const token = await generateUserSignupSession(payload);
    res.json(response.signupConfirmation({
        signup_cred: token,
    }));
}


async function createUserAndWallet(address: string, inviter: any): Promise<IUserWallet> {
    const user = new User({
        user_id: uuidv4(),
        username: address,
        avatar_url: process.env.DEFAULT_AVATAR_URL,
        created_time: Date.now(),
    });
    const userWallet = new UserWallet({
        user_id: user.user_id,
        wallet_addr: address.toLowerCase(),
        created_time: user.created_time,
    });
    await doTransaction(async (session) => {
        const opts = {session};
        await user.save(opts);
        await userWallet.save(opts);
        if (inviter) {
            const invite = new UserInvite({
                user_id: inviter.user_id,
                invitee_id: user.user_id,
                created_time: Date.now(),
            });
            await invite.save(opts);
        }
    });
    return userWallet;
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