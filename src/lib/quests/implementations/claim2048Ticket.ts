import { IQuest } from "@/lib/models/Quest";
import { checkClaimableResult, claimRewardResult } from "@/lib/quests/types";
import { QuestBase } from "@/lib/quests/implementations/base";
import UserMetrics, { Metric } from "@/lib/models/UserMetrics";

export class Claim2048TicketQuest extends QuestBase {
    constructor(quest: IQuest) {
        super(quest);
    }

    async checkClaimable(userId: string): Promise<checkClaimableResult> {
        return {
            claimable: true,
            // require_authorization: likeResult.require_authorization ? AuthorizationType.Twitter : undefined,
            // tip: tip,
            // extra: twitterAuth.twitter_id,
        }
    }

    async claimReward(userId: string): Promise<claimRewardResult> {
        const taint = `2048,${this.quest.id},${userId}`;
        const rewardDelta = await this.checkUserRewardDelta(userId);
        const result = await this.saveUserReward(userId, taint, rewardDelta, null, async (session) => {
            await UserMetrics.updateOne(
                { user_id: userId },
                {
                    $inc: { [Metric.TicketFor2048]: this.quest.properties.tickets },
                    $setOnInsert: {
                        created_time: Date.now(),
                    },
                },
                { upsert: true, session: session },
            );
        });
        
        if (result.duplicated) {
            return {
                verified: false,
                tip: "The user has already claimed tickets.",
            }
        }
        // await sendBadgeCheckMessage(userId, Metric.TwitterConnected);
        return {
            verified: result.done,
            claimed_amount: result.done ? rewardDelta : undefined,
            tip: result.done ? `You have claimed ${rewardDelta} MB and ${this.quest.properties.tickets} tickets for 2048 Game.` : "Server Internal Error",
        }
    }
}