import {redis} from "@/lib/redis/client";
import * as response from "@/lib/response/response";
import {allowToSendCaptcha} from "@/lib/redis/ratelimit";
import {sendCaptchaEmail} from "@/lib/aws/ses";
import {UserContextRequest} from "@/lib/middleware/auth";
import {NextApiResponse} from "next";
import {CaptchaType} from "@/lib/authorization/types";


export async function sendCaptcha(captchaType: CaptchaType, req: UserContextRequest, res: NextApiResponse) {
    const {email, quick_fill_url} = req.query;
    if (!email) {
        res.json(response.invalidParams());
        return
    }
    const emailKey = `${captchaType}:${email}`;
    // 检查邮件是否是测试邮件
    if (email == process.env.APPLE_REVIEW_USERNAME) {
        await redis.setex(emailKey, 60 * 60 * 15, process.env.APPLE_REVIEW_PASSWORD!);
        res.json(response.success());
        return;
    }
    if (email == process.env.GOOGLE_REVIEW_USERNAME) {
        await redis.setex(emailKey, 60 * 60 * 15, process.env.GOOGLE_REVIEW_PASSWORD!);
        res.json(response.success());
        return;
    }

    const clientIP = req.socket.remoteAddress;
    // 检查发送间隔
    const allowed = await allowToSendCaptcha(captchaType, email as string, clientIP as string);
    if (!allowed) {
        res.json(response.sendCaptchaDisallowed());
        return
    }

    const captcha = Math.floor(100000 + Math.random() * 900000);
    await redis.setex(emailKey, 60 * 60 * 15, captcha);
    await sendCaptchaEmail(email as string, captcha, quick_fill_url as string);
    res.json(response.success());
}