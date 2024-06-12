import { IQuest } from "@/lib/models/Quest";
import { checkClaimableResult, claimRewardResult } from "@/lib/quests/types";
import { QuestBase } from "@/lib/quests/implementations/base";
import { format } from "date-fns";
import UserBackpackModel from "@/lib/models/UserBackpack";

export class Claim2048TicketQuest extends QuestBase {
    constructor(quest: IQuest) {
        super(quest);
    }

    async checkClaimable(userId: string): Promise<checkClaimableResult> {
        // 添加用户ticket.
        await UserBackpackModel.updateOne({ uid: userId }, {
            $inc: { num: this.quest.properties.tickets },
            $setOnInsert: {
                uid: userId,
                propId: 1,
                propName: "ticket",
                creatTime: format(new Date(), 'yyyy-MM-dd HH:mm:ss')
            },
        }, { upsert: true });

        return {
            claimable: true,
            // require_authoriza tion: likeResult.require_authorization ? AuthorizationType.Twitter : undefined,
            // tip: tip,
            // extra: twitterAuth.twitter_id,
        }
    }

    async claimReward(userId: string): Promise<claimRewardResult> {
        const taint = `2048,${this.quest.id},${userId}`;
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
            tip: result.done ? `You have claimed ${rewardDelta} MB and ${this.quest.properties.tickets} tickets for 2048 Game.` : "Server Internal Error",
        }
    }
}