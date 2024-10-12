import { IQuest } from "@/lib/models/Quest";
import { checkClaimableResult, claimRewardResult } from "@/lib/quests/types";
import { QuestBase } from "@/lib/quests/implementations/base";
import User from "@/lib/models/User";

export class ClaimLotteryTicketQuest extends QuestBase {
    constructor(quest: IQuest) {
        super(quest);
    }

    async checkClaimable(userId: string): Promise<checkClaimableResult> {
        await User.updateOne({ user_id: userId },
            {
                $inc: { lottery_ticket_amount: this.quest.properties.tickets },
                $setOnInsert: {
                    created_time: Date.now(),
                },
            },
            { upsert: true });

        return {
            claimable: true,
        }
    }

    async claimReward(userId: string): Promise<claimRewardResult> {
        const taint = `lottery,${this.quest.id},${userId}`;
        const rewardDelta = await this.checkUserRewardDelta(userId);
        const result = await this.saveUserReward(userId, taint, rewardDelta, null);

        if (result.duplicated) {
            return {
                verified: false,
                tip: "The user has already claimed tickets.",
            }
        }
        await this.checkClaimable(userId);
        // await sendBadgeCheckMessage(userId, Metric.TwitterConnected);
        return {
            verified: result.done,
            claimed_amount: result.done ? rewardDelta : undefined,
            tip: result.done ?  result.tip ? result.tip : `You have claimed ${rewardDelta} MB and ${this.quest.properties.tickets} lottery tickets.` : result.tip ? result.tip : "Server Internal Error",
        }
    }
}