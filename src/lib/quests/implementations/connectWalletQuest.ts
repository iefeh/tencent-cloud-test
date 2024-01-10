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
import UserMoonBeamAudit, {IUserMoonBeamAudit, UserMoonBeamAuditType} from "@/lib/models/UserMoonBeamAudit";
import User from "@/lib/models/User";
import {isDuplicateKeyError} from "@/lib/mongodb/client";
import {v4 as uuidv4} from "uuid";

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

    async reClaimReward(userId: string): Promise<claimRewardResult> {
        // 检查用户上次校验时间
        const metrics = await UserMetrics.findOne({user_id: userId}, {
            _id: 0,
            [Metric.WalletAssetUsdValue]: 1,
            [Metric.WalletAssetValueLastRefreshTime]: 1
        });
        if (metrics.wallet_asset_value_last_refresh_time) {
            // 计算是否满足重新校验的间隔，必须间隔12小时
            const reverifyAt = Number(metrics.wallet_asset_value_last_refresh_time) + 12 * 60 * 60 * 1000;
            if (Date.now() < reverifyAt) {
                logger.warn(`user ${userId} reclaim quest ${this.quest.id} but cooling down.`);
                return {
                    verified: false,
                    tip: "Verify cooling down, please try again later.",
                };
            }
        }
        if (!metrics.wallet_asset_usd_value) {
            // 如果db中没有值，则设置为-1，以确保refreshUserWalletMetric时保存用户的指标值
            metrics.wallet_asset_usd_value = -1
        }
        // 检查是否可以领取奖励
        const claimableResult = await this.checkClaimable(userId);
        if (!claimableResult.claimable) {
            return {
                verified: false,
                require_authorization: claimableResult.require_authorization,
                tip: claimableResult.require_authorization ? "You should connect your Wallet Address first." : undefined,
            }
        }
        // 检查当前钱包是否存在历史奖励
        const taint = `${this.quest.id},${AuthorizationType.Wallet},${this.user_wallet_addr}`;
        let historyReward = await UserMoonBeamAudit.findOne({reward_taint: taint, deleted_time: null});
        if (historyReward && historyReward.user_id != userId) {
            logger.warn(`user ${userId} trying to reclaim reward from taint address ${this.user_wallet_addr}`);
            return {
                verified: false,
                tip: "The Wallet Address reward has been claimed by other user.",
            }
        }
        if (!historyReward) {
            logger.debug(`user ${userId} using different address ${this.user_wallet_addr} trying to query user last reward.`);
            // 当前是绑定的全新的钱包且没有被领取过奖励，检查当前用户的历史奖励
            historyReward = await UserMoonBeamAudit.findOne({
                user_id: userId,
                corr_id: this.quest.id,
                deleted_time: null
            });
        }
        if (!historyReward) {
            throw new Error(`user ${userId} and wallet ${this.user_wallet_addr} MB audit should but not found.`);
        }

        // 刷新钱包资产
        const refreshResult = await this.refreshUserWalletMetric(userId, this.user_wallet_addr, metrics.wallet_asset_usd_value);
        if (refreshResult.interrupted) {
            return refreshResult.interrupted;
        }
        const rewardDelta = await this.checkUserRewardDelta(userId);
        if (rewardDelta <= historyReward.moon_beam_delta) {
            return {
                verified: true,
                claimed_amount: 0,
                tip: `You have claimed 0 extra MBs.`,
            }
        }
        // 保存用户的增量奖励
        const assetId = refreshResult.userMetric[Metric.WalletAssetId];
        return this.saveUserIncreasedReward(userId, rewardDelta, historyReward, assetId);
    }

    async saveUserIncreasedReward(userId: string, rewardDelta: number, historyReward: IUserMoonBeamAudit, assetId: string): Promise<claimRewardResult> {
        const taint = `${this.quest.id},${AuthorizationType.Wallet},${this.user_wallet_addr}`;
        // 保存用户的增量奖励
        const increasedReward = rewardDelta - Number(historyReward.moon_beam_delta);
        const now = Date.now();
        const audit = new UserMoonBeamAudit({
            user_id: userId,
            type: UserMoonBeamAuditType.Quests,
            moon_beam_delta: rewardDelta,
            reward_taint: taint,
            corr_id: this.quest.id,
            created_time: now,
        });
        historyReward.deleted_time = now;
        try {
            await doTransaction(async (session) => {
                const opts = {session};
                await historyReward.save(opts);
                await audit.save(opts);
                await User.updateOne({user_id: userId}, {$inc: {moon_beam: increasedReward}}, opts);
            })
            return {
                verified: true,
                claimed_amount: increasedReward,
                tip: `Congratulations, you have claimed ${increasedReward} MBs.`,
            }
        } catch (error) {
            if (isDuplicateKeyError(error)) {
                return {
                    verified: false,
                    tip: "The Wallet Address reward has been claimed by other user.",
                }
            }
            console.error(error);
            return {
                verified: false,
                tip: "Server Internal Error.",
            }
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
        const refreshResult = await this.refreshUserWalletMetric(userId, this.user_wallet_addr);
        if (refreshResult.interrupted) {
            return refreshResult.interrupted;
        }
        // 按 任务/钱包 进行污染，防止同一个钱包多次获得该任务奖励
        const taint = `${this.quest.id},${AuthorizationType.Wallet},${this.user_wallet_addr}`;
        const rewardDelta = await this.checkUserRewardDelta(userId);
        if (!rewardDelta) {
            logger.warn((`user ${userId} quest ${this.quest.id} reward amount zero`));
            return {
                verified: false,
                tip: "No eligible conditions for rewards were found. Please retry with a different account.",
            }
        }
        const assetId = refreshResult.userMetric[Metric.WalletAssetId];
        const result = await this.saveUserReward(userId, taint, rewardDelta, assetId);
        if (result.duplicated) {
            return {
                verified: false,
                tip: "The Wallet Address has already claimed reward.",
            }
        }
        return {
            verified: result.done,
            claimed_amount: result.done ? rewardDelta : undefined,
            tip: result.done ? `Congratulations, you have claimed ${rewardDelta} MBs.` : "Server Internal Error",
        }
    }

    // 当返回claimRewardResult时，表示刷新有问题，返回null则表示成功
    async refreshUserWalletMetric(userId: string, wallet: string, historyTotalValue: number = -1): Promise<refreshUserWalletMetricResult> {
        // 检查用户资产的token价值
        let allowed = await retryAllowToSendRequest2Debank(3);
        if (!allowed) {
            logger.warn(`refresh wallet ${wallet} token assets did not get request cred after 3 seconds.`);
            return {
                interrupted: {verified: false, tip: "Network busy, please try again later."},
                userMetric: null,
            };
        }
        const debank = new Debank(process.env.DEBANK_ACCESS_KEY);
        const tokenData = await debank.user.total_balance({id: wallet})
        // 检查用户资产的NFT价值
        allowed = await retryAllowToSendRequest2Debank(3);
        if (!allowed) {
            logger.warn(`refresh wallet ${wallet} nft assets did not get request cred after 3 seconds.`);
            return {
                interrupted: {verified: false, tip: "Network busy, please try again later."},
                userMetric: null,
            };
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
        const totalValue = Number((totalNFTValue + totalTokenValue).toFixed(2));
        // 填充需要保存的对象
        const now = Date.now();
        const walletAsset = new WalletAsset({
            id: uuidv4(),
            user_id: userId,
            wallet_addr: wallet,
            total_usd_value: totalValue,
            token_usd_value: totalTokenValue,
            nft_usd_value: totalNFTValue,
            tokens: tokens,
            nfts: nfts,
            created_time: now,
        });
        const userMetric: any = {
            [Metric.WalletAssetValueLastRefreshTime]: now
        }
        if (totalValue > historyTotalValue) {
            logger.warn(`user ${userId} wallet ${wallet} asset ${totalValue} gt history ${historyTotalValue}`)
            userMetric[Metric.WalletAssetId] = walletAsset.id
            userMetric[Metric.WalletTokenUsdValue] = totalTokenValue
            userMetric[Metric.WalletNftUsdValue] = totalNFTValue
            userMetric[Metric.WalletAssetUsdValue] = totalValue
        } else {
            logger.warn(`user ${userId} wallet ${wallet} asset ${totalValue} lt history ${historyTotalValue}`)
        }
        // 执行数据入库
        await doTransaction(async (session) => {
            // 保存用户的资产凭证
            await walletAsset.save({session});
            // 保存用户的指标信息
            await UserMetrics.updateOne(
                {user_id: userId},
                {
                    $set: userMetric,
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
        return {
            userMetric: userMetric,
        };
    }
}

type refreshUserWalletMetricResult = {
    interrupted?: claimRewardResult;
    // 用户的指标信息
    userMetric: any;
}

export async function queryUserWalletAuthorization(userId: string): Promise<any> {
    return await UserWallet.findOne({user_id: userId, deleted_time: null});
}

// 校验用户是否绑定了钱包
export async function verifyConnectWalletQuest(userId: string, quest: IQuest): Promise<checkClaimableResult> {
    const wallet = await queryUserWalletAuthorization(userId);
    return {claimable: !!wallet};
}