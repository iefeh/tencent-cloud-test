import ContractNFT from "@/lib/models/ContractNFT";
import UserWallet from "@/lib/models/UserWallet";
import {QuestBase} from "@/lib/quests/implementations/base";
import {IQuest} from "@/lib/models/Quest";
import {AuthorizationType} from "@/lib/authorization/types";
import {checkClaimableResult, claimRewardResult, HoldNFT} from "@/lib/quests/types";
import logger from "@/lib/logger/winstonLogger";

export class HoldNFTQuest extends QuestBase {
    // 用户的授权钱包地址，在checkClaimable()时设置
    private user_wallet_addr = "";

    constructor(quest: IQuest) {
        super(quest);
    }

    async checkClaimable(userId: string): Promise<checkClaimableResult> {
        const questProp = this.quest.properties as HoldNFT;
        const userWallet = await UserWallet.findOne({user_id: userId, deleted_time: null});
        if (!userWallet) {
            return {
                claimable: false,
                require_authorization: AuthorizationType.Wallet,
                tip: "You should connect your Wallet Address first.",
            }
        }
        this.user_wallet_addr = userWallet?.wallet_addr;
        const userNft = await ContractNFT.findOne({
            chain_id: questProp.chain_id,
            contract_address: questProp.contract_addr,
            wallet_addr: this.user_wallet_addr,
            transaction_status: "confirmed",
        });
        return {
            claimable: !!userNft,
            tip: userNft ? undefined : "No NFT detected or NFT transaction is pending.",
        }
    }

    async claimReward(userId: string): Promise<claimRewardResult> {
        // 检查用户资格
        const claimableResult = await this.checkClaimable(userId);
        if (!claimableResult.claimable) {
            return {
                verified: false,
                require_authorization: claimableResult.require_authorization,
                tip: claimableResult.tip,
            }
        }
        // 按 任务/钱包 进行污染，防止同一个钱包多次获得该任务奖励
        const taint = `${this.quest.id},${AuthorizationType.Wallet},${this.user_wallet_addr}`;
        const rewardDelta = await this.checkUserRewardDelta(userId);
        if (!rewardDelta) {
            logger.warn((`user ${userId} quest ${this.quest.id} reward amount zero`));
            return {
                verified: false,
                tip: "Server Internal Error",
            }
        }
        const result = await this.saveUserReward(userId, taint, rewardDelta, null);
        if (result.duplicated) {
            return {
                verified: false,
                tip: "The Wallet Address has already claimed reward.",
            }
        }
        return {
            verified: result.done,
            claimed_amount: result.done ? rewardDelta : undefined,
            tip: result.done ? `You have claimed ${rewardDelta} MB.` : "Server Internal Error",
        }
    }
}