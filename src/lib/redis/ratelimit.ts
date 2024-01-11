import {RateLimiter} from "@koshnic/ratelimit";
import {redis} from "@/lib/redis/client";
import {v4 as uuidv4} from "uuid";
import logger from "@/lib/logger/winstonLogger";
import {promiseSleep} from "@/lib/common/sleep";
import {CaptchaType} from "@/lib/authorization/types";

const limiter = new RateLimiter(redis);

export const allowToSendCaptcha = async (captchaTyp: CaptchaType, email: string, ip: string) => {
    // 检查邮件单次发送间隔
    const emailRes = await limiter.allowPerMinute(`${captchaTyp}:${email}`, 1);
    if (!emailRes.allowed) {
        return false;
    }
    // 检查IP当天发送次数
    // const ipRes = await limiter.allowPerHour(`email_captcha:${ip}`, 30, 24);
    // return ipRes.allowed > 0
    return true;
}

// 获取debank请求权限
export const allowToSendRequest2Debank = async () => {
    const res = await limiter.allowPerSecond("debank_request", 100, 1)
    return res.allowed > 0
}

// 重试获取debank请求权限
export const retryAllowToSendRequest2Debank = async (timeoutSecond: number, intervalMillis: number = 500) => {
    // 标记开始时间，用于检查当前是否已经超时
    const startTime = Date.now();
    const timeoutMilliseconds = timeoutSecond * 1000;
    const traceId = uuidv4();
    // 循环直到超时
    while (true) {
        // 计算已经过去的时间
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime > timeoutMilliseconds) {
            logger.warn(`trace:${traceId}  -  retry allow to send request to debank - timeout.`);
            // 如果已经超过了超时时间，返回false
            return false;
        }
        logger.debug(`trace:${traceId}  -  retry allow to send request to debank - trying.`);
        // 调用 allowToSendRequest2Debank 函数检查是否允许发送请求
        const isAllowed = await allowToSendRequest2Debank();
        if (isAllowed) {
            logger.debug(`trace:${traceId}  -  retry allow to send request to debank - allowed.`);
            return true;
        }

        // 当前已经限流，则继续等待指定的间隔
        await promiseSleep(intervalMillis);
    }
}