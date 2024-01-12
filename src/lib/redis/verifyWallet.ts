import {getClientIP} from "@/lib/common/request";
import {allowIP2VerifyWalletAsset} from "@/lib/redis/ratelimit";
import logger from "@/lib/logger/winstonLogger";
import * as response from "@/lib/response/response";

export async function checkWalletVerificationCDForIP(req: any, res: any): Promise<boolean> {
    // 检查当前ip是否被限制，限制IP 12小时内只允许校验3次
    const clientIP = getClientIP(req);
    const allowIP = await allowIP2VerifyWalletAsset(clientIP, false)
    if (allowIP.remaining == 0) {
        logger.warn(`user ${req.user_id} verify wallet reached ip ${clientIP} limit.`);
        res.json(response.success({
            verified: false,
            tip: "The requests from your IP address have reached the limit. Please try again in 12 hours.",
        }));
        return false;
    }
    return true;
}

export async function addWalletVerificationCDForIP(req: any) {
    const clientIP = getClientIP(req);
    try {
        await allowIP2VerifyWalletAsset(clientIP)
    } catch (e) {
        logger.error(e)
    }
}