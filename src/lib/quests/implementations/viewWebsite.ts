import { IQuest } from "@/lib/models/Quest";
import { checkClaimableResult, claimRewardResult } from "@/lib/quests/types";
import { QuestBase } from "@/lib/quests/implementations/base";
import { format } from "date-fns";
import UserBackpackModel from "@/lib/models/UserBackpack";

export class ViewWebsiteQuest extends QuestBase {
    constructor(quest: IQuest) {
        super(quest);
    }

    async checkClaimable(userId: string): Promise<checkClaimableResult> {
        return {
            claimable: true,
        }
    }

    async claimReward(userId: string): Promise<claimRewardResult> {
        const taint = `view-website,${this.quest.id},${userId}`;
        const rewardDelta = await this.checkUserRewardDelta(userId);
        const result = await this.saveUserReward(userId, taint, rewardDelta, null);

        if (result.duplicated) {
            return {
                verified: false,
                tip: "The user has already claimed tickets.",
            }
        }

        return {
            verified: result.done,
            claimed_amount: result.done ? rewardDelta : undefined,
            tip: result.done ? `You have claimed ${rewardDelta} MBs.` : "Server Internal Error",
        }
    }
}