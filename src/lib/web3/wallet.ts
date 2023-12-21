import {ethers} from "ethers";

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
        return false;
    }
}