import {RateLimiter} from "@koshnic/ratelimit";
import {redis} from "@/lib/redis/client";

const limiter = new RateLimiter(redis);

export const allowToSendLoginCaptcha = async (email: string, ip: string) => {
    // 检查邮件单次发送间隔
    const emailRes = await limiter.allowPerMinute(`login_captcha:${email}`, 1);
    if (!emailRes.allowed) {
        return false;
    }
    // 检查IP当天发送次数
    const ipRes = await limiter.allowPerHour(`login_captcha:${ip}`, 30, 24);
    return ipRes.allowed > 0
}