import UserWallet from "@/lib/models/UserWallet";
import {IQuest} from "@/lib/models/Quest";
import {checkClaimableResult, claimRewardResult} from "@/lib/quests/types";
import {QuestBase} from "@/lib/quests/implementations/base";
import {AuthorizationType} from "@/lib/authorization/types";
import {retryAllowToSendRequest2Debank} from "@/lib/redis/ratelimit";
import logger from "@/lib/logger/winstonLogger";
import WalletAsset, {WalletNFT, WalletToken} from "@/lib/models/WalletAsset";
import doTransaction from "@/lib/mongodb/transaction";
import UserMetrics, {Metric} from "@/lib/models/UserMetrics";

const Debank = require('debank')

export class ConnectWalletQuest extends QuestBase {
    // 用户的授权钱包地址，在checkClaimable()时设置
    private user_wallet_addr = "";

    constructor(quest: IQuest) {
        super(quest);
    }

    async checkClaimable(userId: string): Promise<checkClaimableResult> {
        const userWallet = await UserWallet.findOne({user_id: userId, deleted_time: null});
        this.user_wallet_addr = userWallet?.wallet_addr;
        return {
            claimable: !!userWallet,
            require_authorization: userWallet ? undefined : AuthorizationType.Wallet,
        }
    }

    async claimReward(userId: string): Promise<claimRewardResult> {
        const claimableResult = await this.checkClaimable(userId);
        if (!claimableResult.claimable) {
            return {
                verified: false,
                require_authorization: claimableResult.require_authorization,
                tip: claimableResult.require_authorization ? "You should connect your Wallet Address first." : undefined,
            }
        }
        await this.refreshUserWalletMetric(userId, this.user_wallet_addr);
        // 按 任务/钱包 进行污染，防止同一个钱包多次获得该任务奖励
        const taint = `${this.quest.id},${AuthorizationType.Wallet},${this.user_wallet_addr}`;
        const rewardDelta = await this.checkUserRewardDelta(userId);
        const result = await this.saveUserReward(userId, taint, rewardDelta);
        if (result.duplicated) {
            return {
                verified: false,
                tip: "The Wallet Address has already claimed reward.",
            }
        }
        return {verified: result.done, claimed_amount: result.done ? rewardDelta : undefined}
    }

    // 当返回claimRewardResult时，表示刷新有问题，返回null则表示成功
    async refreshUserWalletMetric(userId: string, wallet: string): Promise<claimRewardResult | null> {
        // 检查用户资产的token价值
        let allowed = await retryAllowToSendRequest2Debank(3);
        if (!allowed) {
            logger.warn(`refresh wallet ${wallet} token assets did not get request cred after 3 seconds.`);
            return {verified: false, tip: "Network busy, please try again later."};
        }
        const debank = new Debank(process.env.DEBANK_ACCESS_KEY);
        const tokenData = await debank.user.total_balance({id: wallet})
        // 检查用户资产的NFT价值
        allowed = await retryAllowToSendRequest2Debank(3);
        if (!allowed) {
            logger.warn(`refresh wallet ${wallet} nft assets did not get request cred after 3 seconds.`);
            return {verified: false, tip: "Network busy, please try again later."};
        }
        // 各字段含义：https://docs.cloud.debank.com/en/readme/api-pro-reference/user#returns-10
        const nftData = await debank.user.all_nft_list({
            id: wallet,
            is_all: false
        })
        // 计算指标值
        const totalTokenValue = Number(tokenData.total_usd_value.toFixed(2));
        const tokens = tokenData.chain_list.filter((token: WalletToken) => token.usd_value > 0);
        const nfts = nftData.filter((nft: WalletNFT) => nft.usd_price > 0);
        let totalNFTValue = nfts.reduce((sum: number, nft: WalletNFT) => {
            // 根据最新成交价格评估NFT价值
            return sum + nft.usd_price * nft.amount;
        }, 0);
        totalNFTValue = Number(totalNFTValue.toFixed(2));
        const now = Date.now();
        // 执行数据入库
        await doTransaction(async (session) => {
            // 保存用户的资产凭证
            await WalletAsset.updateOne(
                {wallet_addr: wallet},
                {
                    $set: {
                        "total_usd_value": totalNFTValue + totalTokenValue,
                        "token_usd_value": totalTokenValue,
                        "nft_usd_value": totalNFTValue,
                        "tokens": tokens,
                        "nfts": nfts,
                        "updated_time": now,
                    },
                    $setOnInsert: {
                        "created_time": now,
                    }
                },
                {
                    session: session,
                    upsert: true
                }
            );
            // 保存用户的指标信息
            await UserMetrics.updateOne(
                {user_id: userId},
                {
                    $set: {
                        [Metric.WalletTokenUsdValue]: totalTokenValue,
                        [Metric.WalletNftUsdValue]: totalNFTValue,
                        [Metric.WalletAssetUsdValue]: totalNFTValue + totalTokenValue,
                        [Metric.WalletAssetValueLastRefreshTime]: now,
                    },
                    $setOnInsert: {
                        "created_time": now,
                    }
                },
                {
                    session: session,
                    upsert: true
                }
            );
        });
        return null;
    }
}

export async function queryUserWalletAuthorization(userId: string): Promise<any> {
    return await UserWallet.findOne({user_id: userId, deleted_time: null});
}

// 校验用户是否绑定了钱包
export async function verifyConnectWalletQuest(userId: string, quest: IQuest): Promise<checkClaimableResult> {
    const wallet = await queryUserWalletAuthorization(userId);
    return {claimable: !!wallet};
}