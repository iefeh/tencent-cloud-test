import {RateLimiter} from "@koshnic/ratelimit";
import {redis} from "@/lib/redis/client";
import {v4 as uuidv4} from "uuid";
import logger from "@/lib/logger/winstonLogger";
import {promiseSleep} from "@/lib/common/sleep";
import {CaptchaType} from "@/lib/authorization/types";

const limiter = new RateLimiter(redis);

// 检查当前IP是否允许校验钱包资产
// cost表示当前是否真实的尝试消耗一次限流桶里面的令牌
export const allowIP2VerifyWalletAsset = async (ip: string, cost: boolean = true) => {
    // 每12小时允许同1个IP校验3次
    return await limiter.allow(`wallet_asset_cd:ip:${ip}`, {
        burst: 3,
        ratePerPeriod: 3,
        period: 12 * 60 * 60,
        cost: cost ? 1 : 0,
    });
}

// 检查当前用户是否允许校验钱包资产
// cost表示当前是否真实的尝试消耗一次限流桶里面的令牌
export const allowUser2VerifyWalletAsset = async (userId: string, cost: boolean = true) => {
    // 每12小时允许同1个用户校验1次
    return await limiter.allow(`wallet_asset_cd:user:${userId}`, {
        burst: 1,
        ratePerPeriod: 1,
        period: 12 * 60 * 60,
        cost: cost ? 1 : 0,
    });
}

export const allowToSendCaptcha = async (captchaTyp: CaptchaType, email: string, ip: string) => {
    // 检查邮件单次发送间隔
    const emailRes = await limiter.allowPerMinute(`${captchaTyp}:${email}`, 1);
    if (!emailRes.allowed) {
        return false;
    }
    // 检查IP当天发送次数
    const ipRes = await limiter.allowPerHour(`email_captcha:${ip}`, 30, 24);
    return ipRes.allowed > 0
}

// 获取debank请求权限
export const allowToSendRequest2Debank = async () => {
    const res = await limiter.allowPerSecond("debank_request", 100, 1)
    return res.allowed > 0
}

// 获取reservoir请求权限
export const allowToSendRequest2Reservoir = async () => {
    const res = await limiter.allowPerSecond("reservoir_request", 120, 60)
    return res.allowed > 0
}

// 重试获取debank请求权限
export const retryAllowToSendRequest2Debank = async (timeoutSecond: number, intervalMillis: number = 500) => {
    return retryAllowToSendRequest(allowToSendRequest2Debank, timeoutSecond, intervalMillis);
}

// 重试获取reservoir请求权限
export const retryAllowToSendRequest2Reservoir = async (timeoutSecond: number, intervalMillis: number = 500) => {
    return retryAllowToSendRequest(allowToSendRequest2Reservoir, timeoutSecond, intervalMillis);
}

// 通用重试请求权限函数
export const retryAllowToSendRequest = async (allowToSendRequest: any, timeoutSecond: number, intervalMillis: number = 500) => {
    // 标记开始时间，用于检查当前是否已经超时
    const startTime = Date.now();
    const timeoutMilliseconds = timeoutSecond * 1000;
    const traceId = uuidv4();
    // 循环直到超时
    while (Date.now() - startTime < timeoutMilliseconds) {
        // logger.debug(`trace:${traceId} - retry allow to send request - trying.`);
        // 调用传入的请求权限函数检查是否允许发送请求
        const isAllowed = await allowToSendRequest();
        if (isAllowed) {
            // logger.debug(`trace:${traceId} - retry allow to send request - allowed.`);
            return true;
        }
        // 如果不允许，则等待指定的间隔时间后重试
        await promiseSleep(intervalMillis);
    }
    // 超时后记录警告并返回false
    logger.warn(`trace:${traceId} - retry allow to send request - timeout.`);
    return false;
};