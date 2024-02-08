import {IQuest} from "@/lib/models/Quest";
import {checkClaimableResult, claimRewardResult} from "@/lib/quests/types";
import {ConnectTwitterQuest} from "@/lib/quests/implementations/connectTwitterQuest";
import UserTwitter from "@/lib/models/UserTwitter";
import {AuthorizationType} from "@/lib/authorization/types";
import {promiseSleep} from "@/lib/common/sleep";
import UserMetrics, {Metric} from "@/lib/models/UserMetrics";
import logger from "@/lib/logger/winstonLogger";
import doTransaction from "@/lib/mongodb/transaction";
import QuestAchievement from "@/lib/models/QuestAchievement";
import User from "@/lib/models/User";


export class RetweetTweetQuest extends ConnectTwitterQuest {
    constructor(quest: IQuest) {
        super(quest);
    }

    async checkClaimable(userId: string): Promise<checkClaimableResult> {
        // 此处只要用户绑定了twitter账号就行，不强求授权token的有效性
        const userTwitter = await UserTwitter.findOne({user_id: userId, deleted_time: null});
        if (!userTwitter) {
            return {
                claimable: false,
                require_authorization: AuthorizationType.Twitter,
            }
        }
        return {
            claimable: await this.checkAchieved(userId),
        }
    }

    async addUserAchievement(userId: string, verified: boolean): Promise<void> {
        const now = Date.now();
        const achievement = new QuestAchievement({
            user_id: userId,
            quest_id: this.quest.id,
            created_time: now,
            verified_time: now,
        });
        // 添加用户任务完成记录与转推次数
        await doTransaction(async (session) => {
            await achievement.save({session: session});
            await UserMetrics.updateOne(
                {user_id: userId},
                {
                    $inc: {[Metric.RetweetCount]: 1},
                    $setOnInsert: {
                        "created_time": now,
                    }
                },
                {upsert: true, session: session}
            );
        })
    }

    async claimReward(userId: string): Promise<claimRewardResult> {
        // 检查用户的twitter
        const userTwitter = await UserTwitter.findOne({user_id: userId, deleted_time: null});
        if (!userTwitter) {
            return {
                verified: false,
                require_authorization: AuthorizationType.Twitter,
                tip: "You should connect your Twitter Account first."
            }
        }
        // 检查用户是否完成任务
        const achieved = await this.checkAchieved(userId);
        if (!achieved) {
            return {
                verified: false,
                tip: "Please click retweet to complete task first."
            }
        }
        // 伪装在验证
        await promiseSleep(2000);

        // 污染twitter，确保同一个twitter单任务只能获取一次奖励
        const taint = `${this.quest.id},${AuthorizationType.Twitter},${userTwitter.twitter_id}`;
        const rewardDelta = await this.checkUserRewardDelta(userId);
        // retweet时额外添加用户的转推次数
        const result = await this.saveUserReward(userId, taint, rewardDelta, null, async (session) => {
            await UserMetrics.updateOne(
                {user_id: userId},
                {
                    $inc: {[Metric.RetweetCount]: 1},
                    $setOnInsert: {
                        "created_time": Date.now(),
                    }
                },
                {upsert: true, session: session}
            );
        });
        if (result.duplicated) {
            return {
                verified: false,
                tip: "The Twitter Account has already claimed reward.",
            }
        }
        return {
            verified: result.done,
            claimed_amount: result.done ? rewardDelta : undefined,
            tip: result.done ? `You have claimed ${rewardDelta} MB.` : "Server Internal Error",
        }
    }

    isPrepared(): boolean {
        return true;
    }
}