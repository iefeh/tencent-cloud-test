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
        const holdNFT = this.quest.properties as HoldNFT;
        const addr = holdNFT.contract_addr;
        const id = holdNFT.chain_id;
        const userWallet = await UserWallet.findOne({user_id: userId, deleted_time: null});
        const user_wallet_addr = userWallet?.wallet_addr;
        const userNft = await ContractNFT.findOne({contract_address: addr, chain_id: id, deleted_time: null, wallet_addr: user_wallet_addr});
        return {
            claimable: !!userNft,
        }
    }

    async claimReward(userId: string): Promise<claimRewardResult> {
        // 检查用户资格
        const claimableResult = await this.checkClaimable(userId);
        if (!claimableResult.claimable) {
            return {
                verified: false,
                tip: "You has no NFT."
            }
        }
        // 污染用户的白名单，确保单个白名单只能获取一次奖励
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