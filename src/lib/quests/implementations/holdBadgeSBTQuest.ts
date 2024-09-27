import { IQuest } from "@/lib/models/Quest";
import { HoldBadgeSBT, checkClaimableResult, claimRewardResult } from "@/lib/quests/types";
import { QuestBase } from "@/lib/quests/implementations/base";
import Mint from "@/lib/models/Mint";

export class HoldBadgeSBTQuest extends QuestBase {
    constructor(quest: IQuest) {
        super(quest);
    }

    async checkClaimable(userId: string): Promise<checkClaimableResult> {
        const props = this.quest.properties as HoldBadgeSBT;
        // 查询是否持有对应mint
        const mint = await Mint.findOne({ user_id: userId, source_id: props.badge_id, badge_level: props.badge_level, status: "confirmed" });
        return {
            claimable: !!mint,
            tip: !!mint ? undefined : 'This account is not in possession of a confirmed badge SBT.'
        }
    }

    async claimReward(userId: string): Promise<claimRewardResult> {
        // 检查用户资格
        const claimableResult = await this.checkClaimable(userId);
        if (!claimableResult.claimable) {
            return {
                verified: false,
                tip: claimableResult.tip,
            };
        }

        // 领取奖励
        const taint = `${this.quest.id},${userId}`;
        const rewardDelta = await this.checkUserRewardDelta(userId);
        const result = await this.saveUserReward(userId, taint, rewardDelta, null);
        if (result.duplicated) {
            return {
                verified: false,
                tip: "The user has already claimed reward.",
            }
        }

        return {
            verified: result.done,
            claimed_amount: result.done ? rewardDelta : undefined,
            tip: result.done ? `You have claimed ${rewardDelta} MB.` : result.tip ? result.tip : "Server Internal Error",
        }
    }
}