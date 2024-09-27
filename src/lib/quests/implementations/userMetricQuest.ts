import {QuestBase} from "@/lib/quests/implementations/base";
import {IQuest} from "@/lib/models/Quest";
import {checkClaimableResult, claimRewardResult, UserMetric} from "@/lib/quests/types";
import UserMetrics from "@/lib/models/UserMetrics";
import logger from "@/lib/logger/winstonLogger";
import { sendBadgeCheckMessage } from "@/lib/kafka/client";


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

    async addUserAchievement<T>(userId: string, verified: boolean, extraTxOps: (session: any) => Promise<T> = () => Promise.resolve(<T>{})): Promise<void> {
        await super.addUserAchievement(userId, verified);
        await sendBadgeCheckMessage(userId, this.properties.metric);
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
                tip: "You have already claimed reward.",
            }
        }
        await sendBadgeCheckMessage(userId, this.properties.metric);
        return {
            verified: result.done,
            claimed_amount: result.done ? rewardDelta : undefined,
            tip: result.done ? `You have claimed ${rewardDelta} MB.` : result.tip ? result.tip : "Server Internal Error",
        }
    }
}