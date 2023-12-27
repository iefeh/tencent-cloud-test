import {IQuest} from "@/lib/models/Quest";
import {checkClaimableResult, claimRewardResult} from "@/lib/quests/types";

export abstract class QuestBase {
    quest: IQuest;

    constructor(quest: IQuest) {
        this.quest = quest;
    }

    // 检查用户是否已完成任务，可以领取奖励
    abstract checkClaimable(userId: string): Promise<checkClaimableResult>;

    // 用户领取对应任务的奖励
    abstract claimReward(userId: string): Promise<claimRewardResult>;
}

