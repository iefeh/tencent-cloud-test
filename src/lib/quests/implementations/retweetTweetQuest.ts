import {IQuest} from "@/lib/models/Quest";
import {claimRewardResult} from "@/lib/quests/types";
import {ConnectTwitterQuest} from "@/lib/quests/implementations/connectTwitterQuest";
import UserTwitter from "@/lib/models/UserTwitter";
import {AuthorizationType} from "@/lib/authorization/types";
import {promiseSleep} from "@/lib/common/sleep";
import UserMetrics, {Metric} from "@/lib/models/UserMetrics";


export class RetweetTweetQuest extends ConnectTwitterQuest {
    constructor(quest: IQuest) {
        super(quest);
    }

    async claimReward(userId: string): Promise<claimRewardResult> {
        await promiseSleep(1200);
        // 获取用户的twitter
        const userTwitter = await UserTwitter.findOne({user_id: userId, deleted_time: null});
        if (!userTwitter) {
            return {
                verified: false,
                require_authorization: AuthorizationType.Twitter,
                tip: "You should connect your Twitter Account first."
            }
        }
        // 污染twitter，确保同一个twitter单任务只能获取一次奖励
        const taint = `${this.quest.id},${AuthorizationType.Twitter},${userTwitter.twitter_id}`;
        const rewardDelta = await this.checkUserRewardDelta(userId);
        // retweet时额外添加用户的转推次数
        const result = await this.saveUserReward(userId, taint, rewardDelta, async (session) => {
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
                tip: "The twitter Account has already claimed reward.",
            }
        }
        return {
            verified: result.done,
            claimed_amount: result.done ? rewardDelta : undefined,
            tip: result.done ? `Congratulations, you have claimed ${rewardDelta} MBs.` : "Server Internal Error",
        }
    }
}