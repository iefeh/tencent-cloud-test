import {IQuest} from "@/lib/models/Quest";
import {checkClaimableResult, claimRewardResult} from "@/lib/quests/types";
import QuestAchievement from "@/lib/models/QuestAchievement";
import UserMoonBeamAudit, {UserMoonBeamAuditType} from "@/lib/models/UserMoonBeamAudit";
import doTransaction from "@/lib/mongodb/transaction";
import User from "@/lib/models/User";
import {AuthorizationType} from "@/lib/authorization/types";
import {isDuplicateKeyError} from "@/lib/mongodb/client";

// 任务基类，用户的任务状态：
// 1.是否完成了当前任务，完成/未完成，通过具体任务的checkClaimable()函数判断
// 2.是否已经领取任务奖励，已校验/未校验，通过checkVerified()函数判断
export abstract class QuestBase {
    quest: IQuest;

    constructor(quest: IQuest) {
        this.quest = quest;
    }

    // 检查用户是否已完成任务，可以领取奖励
    abstract checkClaimable(userId: string): Promise<checkClaimableResult>;

    // 用户领取对应任务的奖励
    abstract claimReward(userId: string): Promise<claimRewardResult>;

    // 检查用户是否已经领取任务奖励
    async checkVerified(userId: string): Promise<boolean> {
        const achievement = await QuestAchievement.findOne({user_id: userId, quest_id: this.quest.id});
        return !!achievement;
    }

    // 保存用户的奖励
    async saveUserReward(userId: string, taint: string, moonBeamDelta: number): Promise<{ done: boolean, duplicated: boolean }> {
        const now = Date.now();
        const achievement = new QuestAchievement({
            quest_id: this.quest.id,
            user_id: userId,
            created_time: now,
        });
        const audit = new UserMoonBeamAudit({
            user_id: userId,
            type: UserMoonBeamAuditType.Quests,
            moon_beam_delta: moonBeamDelta,
            reward_taint: taint,
            corr_id: this.quest.id,
            created_time: now,
        });
        try {
            await doTransaction(async (session) => {
                const opts = {session};
                await achievement.save(opts);
                await audit.save(opts);
                await User.updateOne({user_id: userId}, {$inc: {moon_beam: audit.moon_beam_delta}}, opts);
            })
            return {done: true, duplicated: false}
        } catch (error) {
            if (isDuplicateKeyError(error)) {
                return {done: false, duplicated: true}
            }
            console.error(error);
            return {done: false, duplicated: false}
        }
    }
}

