import {QuestBase} from "@/lib/quests/implementations/base";
import {IQuest} from "@/lib/models/Quest";
import {checkClaimableResult, claimRewardResult, UserMetric} from "@/lib/quests/types";
import UserMetrics from "@/lib/models/UserMetrics";


export class UserMetricQuest extends QuestBase {
    properties: UserMetric;

    constructor(quest: IQuest) {
        super(quest);
        this.properties = quest.properties;
    }

    constructUserMetricFilter(userId: string): Object {
        switch (this.properties.operator) {
            case '==':
                return {user_id: userId, [this.properties.metric]: this.properties.value};
            case '>=':
                return {user_id: userId, [this.properties.metric]: {$gte: this.properties.value}};
            case '<=':
                return {user_id: userId, [this.properties.metric]: {$lte: this.properties.value}};
            case '>':
                return {user_id: userId, [this.properties.metric]: {$gt: this.properties.value}};
            case '<':
                return {user_id: userId, [this.properties.metric]: {$lt: this.properties.value}};
            default:
                throw new Error("unknown user metric operator");
        }
    }

    async checkClaimable(userId: string): Promise<checkClaimableResult> {
        const metricFilter = this.constructUserMetricFilter(userId);
        const userMetric = await UserMetrics.findOne(metricFilter, {_id: 0, user_id: 1});
        return {
            claimable: !!userMetric,
        }
    }

    async claimReward(userId: string): Promise<claimRewardResult> {
        const claimableResult = await this.checkClaimable(userId);
        if (!claimableResult.claimable) {
            return {
                verified: false,
                tip: "You have not completed task.",
            }
        }
        // 污染用户，确保同一个用户单任务只能获取一次奖励
        const taint = `${this.quest.id},user,${userId}`;
        const result = await this.saveUserReward(userId, taint, this.quest.reward.amount);
        if (result.duplicated) {
            return {
                verified: false,
                tip: "You have already claimed reward.",
            }
        }
        return {verified: result.done, claimed_amount: result.done ? this.quest.reward.amount : undefined}
    }
}