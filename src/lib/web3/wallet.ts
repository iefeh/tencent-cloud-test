import {ethers} from "ethers";
import * as response from "@/lib/response/response";
import logger from "@/lib/logger/winstonLogger";
import * as Sentry from "@sentry/nextjs";

/**
 * 校验当前签名的钱包
 *
 * @param req http请求对象
 * @param res http响应对象
 * @returns 如果签名有效则签名的钱包地址，否则通过res响应并返回""
 */
export function verifySignWallet(req: any, res: any): string {
    const {address, message, signature} = req.body;
    if (!address || !message || !signature) {
        res.json(response.invalidParams());
        return "";
    }
    const validSig = verifySignature(address, message, signature);
    if (!validSig) {
        res.json(response.walletSignatureMismatch());
        return "";
    }
    // 校验签名时间戳
    const messages = message.split(":");
    if (messages.length != 2) {
        logger.error(`want wallet ${address} sign message timestamp but not got`);
        res.json(response.walletSignatureMismatch());
        return "";
    }
    const signature_time = Number(messages[1]);
    // 签名时间必须在5min内
    const timePassed = Date.now() - signature_time;
    // if (timePassed > 5 * 50 * 1000) {
    //     logger.warn(`wallet ${address} signature expired`);
    //     res.json(response.walletSignatureExpired());
    //     return "";
    // }
    return address.toLowerCase();
}


/**
 * 使用web3.js验证Ethereum签名
 *
 * @param address 用户的Ethereum地址
 * @param message 签名的原始消息
 * @param signature 签名
 * @returns 如果签名有效则返回true，否则返回false
 */
export function verifySignature(address: string, message: string, signature: string): boolean {
    try {
        // 使用ethers的工具函数恢复签名者地址
        const recoveredAddress = ethers.verifyMessage(message, signature);
        // 检查恢复的地址是否与用户提供的地址匹配
        return recoveredAddress.toLowerCase() === address.toLowerCase();
    } catch (error) {
        console.error("签名验证错误:", error);
        Sentry.captureException(error);
        return false;
    }
}