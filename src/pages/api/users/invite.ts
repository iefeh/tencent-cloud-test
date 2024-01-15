import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import * as response from "@/lib/response/response";
import {mustAuthInterceptor, UserContextRequest} from "@/lib/middleware/auth";
import {errorInterceptor} from "@/lib/middleware/error";
import {redis} from "@/lib/redis/client";
import User from "@/lib/models/User";
import {timeoutInterceptor} from "@/lib/middleware/timeout";
import getMongoConnection, {isDuplicateKeyError} from "@/lib/mongodb/client";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(errorInterceptor(), mustAuthInterceptor, timeoutInterceptor()).get(async (req, res) => {
    const userId = req.userId!;
    // 锁定用户避免多次生成用户的邀请码
    const lockKey = `user_invite_lock:${userId}`;
    const locked = await redis.set(lockKey, 1, "EX", 30, "NX");
    if (!locked) {
        return res.json(response.tooManyRequests());
    }
    try {
        await getMongoConnection();
        // 获取用户的邀请码
        const user = await User.findOne({user_id: userId, deleted_time: null}, {_id: 0, invite_code: 1});
        if (!user) {
            throw new Error(`user ${userId} should but not found`);
        }
        if (!user.invite_code) {
            // 添加用户的邀请码
            for (let i = 0; i < 5; i++) {
                const inviteCode = await try2GenerateUserInviteCode(userId);
                if (inviteCode) {
                    user.invite_code = inviteCode;
                    break;
                }
            }
            if (!user.invite_code) {
                throw new Error(`fail to generate user ${userId} invite code`);
            }
        }
        return res.json(response.success({
            invite_code: user.invite_code,
        }));
    } finally {
        await redis.del(lockKey);
    }
});

async function try2GenerateUserInviteCode(userId: string): Promise<string> {
    try {
        const code = generateNewInviteCode();
        await User.updateOne({user_id: userId, invite_code: null}, {invite_code: code});
        return code;
    } catch (err) {
        if (isDuplicateKeyError(err)) {
            return "";
        }
        throw err;
    }
}

function generateNewInviteCode(length = 8) {
    // 排除 0, 1, O, I
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

// this will run if none of the above matches
router.all((req, res) => {
    res.status(405).json({
        error: "Method not allowed",
    });
});

export default router.handler();
export const config = {
    api: {
        // 见https://nextjs.org/docs/pages/building-your-application/routing/api-routes#custom-config
        // 添加此配置以移除"API resolved without sending a response"警告
        externalResolver: true,
    },
}