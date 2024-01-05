import {IQuest} from "@/lib/models/Quest";
import {checkClaimableResult, claimRewardResult, QuestRewardType, QuestType, Whitelist} from "@/lib/quests/types";
import QuestAchievement from "@/lib/models/QuestAchievement";
import UserMoonBeamAudit, {UserMoonBeamAuditType} from "@/lib/models/UserMoonBeamAudit";
import doTransaction from "@/lib/mongodb/transaction";
import User from "@/lib/models/User";
import {isDuplicateKeyError} from "@/lib/mongodb/client";
import UserMetricReward, {checkMetricReward, IUserMetricReward} from "@/lib/models/UserMetricReward";
import UserMetrics from "@/lib/models/UserMetrics";
import logger from "@/lib/logger/winstonLogger";
import {getUserFirstWhitelist} from "@/lib/common/user";

interface IProjection {
    [key: string]: number;
}

// 任务基类，用户的任务状态：
// 1.是否完成了当前任务，完成/未完成，通过具体任务的checkClaimable()函数判断
// 2.是否已经领取任务奖励，已校验/未校验，通过checkVerified()函数判断
export abstract class QuestBase {
    quest: IQuest;

    protected constructor(quest: IQuest) {
        this.quest = quest;
    }

    // 检查用户是否已完成任务，可以领取奖励
    abstract checkClaimable(userId: string): Promise<checkClaimableResult>;

    // 用户领取对应任务的奖励
    abstract claimReward(userId: string): Promise<claimRewardResult>;

    async checkUserRewardDelta(userId: string): Promise<number> {
        // 检查静态任务奖励
        if (this.quest.reward.type == QuestRewardType.Fixed) {
            return this.quest.reward.amount;
        }
        // 检查是否指标奖励
        if (this.quest.reward.range_reward_ids && this.quest.reward.range_reward_ids.length > 0) {
            return this.checkUserRewardDeltaFromUserMetric(userId);
        }
        // 检查是否白名单奖励，
        // 注意最后检查的白名单奖励，即白名单类型任务可以通过名单发放奖励，也可以通过指标发放奖励
        if (this.quest.type == QuestType.Whitelist) {
            return this.checkUserRewardDeltaFromWhitelist(userId);
        }
        throw new Error(`unknown ${this.quest.type} quest ${this.quest.id} reward delta`);
    }

    private async checkUserRewardDeltaFromWhitelist(userId: string): Promise<number> {
        const whitelist = this.quest.properties as Whitelist;
        const userWl = await getUserFirstWhitelist(userId, whitelist.whitelist_id);
        if (!userWl || !userWl.reward || !userWl.reward.moon_beams) {
            throw new Error(`quest ${this.quest.id} user ${userId} whitelist ${whitelist.whitelist_id} reward not properly configured`);
        }
        return userWl?.reward?.moon_beams!;
    }

    private async checkUserRewardDeltaFromUserMetric(userId: string): Promise<number> {
        // 动态任务奖励，查询关联的奖励设置，根据设置计算用户奖励
        const rewardIds = this.quest.reward.range_reward_ids;
        const rewards = await UserMetricReward.find({id: {$in: rewardIds}});
        // 查询需要的用户指标
        const projection: IProjection = {_id: 0};
        rewards.forEach((reward: IUserMetricReward) => projection[reward.require_metric] = 1);
        const userMetric = await UserMetrics.findOne({user_id: userId}, projection);
        // 检查用户指标是否存在，不存在时直接报错
        for (let reward of rewards) {
            if (reward.require_metric in userMetric) {
                continue;
            }
            throw new Error(`quest ${this.quest.id} reward ${reward.id} want metric ${reward.require_metric} but not found from user ${userId}`);
        }
        // 计算用户总计奖励数量
        let totalReward = 0;
        rewards.forEach(reward => {
            const userMetricValue = userMetric[reward.require_metric];
            const rewardItem = checkMetricReward(userMetricValue, reward);
            if (rewardItem) {
                logger.debug(`user ${userId} reached ${reward.require_metric} reward MB ${rewardItem.reward_moon_beam}`);
                totalReward += rewardItem.reward_moon_beam!;
            }
        });
        if (!totalReward) {
            throw new Error(`user ${userId} quest ${this.quest.id} reward amount zero`);
        }
        return totalReward;
    }

    // 检查用户是否达成任务
    async checkAchieved(userId: string): Promise<boolean> {
        const achievement = await QuestAchievement.findOne({user_id: userId, quest_id: this.quest.id});
        return !!achievement;
    }

    // 检查用户是否已经领取任务奖励
    async checkVerified(userId: string): Promise<boolean> {
        const reward = await UserMoonBeamAudit.findOne({user_id: userId, corr_id: this.quest.id, deleted_time: null});
        return !!reward;
    }

    // 保存用户的奖励，可选回调参数extraTxOps，用于添加额外的事务操作
    async saveUserReward<T>(userId: string, taint: string, moonBeamDelta: number, extra_info: string | null, extraTxOps: (session: any) => Promise<T> = () => Promise.resolve(<T>{})): Promise<{ done: boolean, duplicated: boolean }> {
        const now = Date.now();
        const audit = new UserMoonBeamAudit({
            user_id: userId,
            type: UserMoonBeamAuditType.Quests,
            moon_beam_delta: moonBeamDelta,
            reward_taint: taint,
            corr_id: this.quest.id,
            created_time: now,
        });
        try {
            // 保存用户任务达成记录、任务奖励记录、用户MB奖励
            await doTransaction(async (session) => {
                if (extraTxOps) {
                    // 执行额外的事务操作
                    await extraTxOps(session);
                }
                const opts = {session};
                await QuestAchievement.updateOne({user_id: userId, quest_id: this.quest.id}, {
                    $setOnInsert: {created_time: Date.now()},
                }, {upsert: true, session: session});
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

