import {PipelineStage} from "mongoose";
import UserTwitter from "@/lib/models/UserTwitter";
import {IQuest} from "@/lib/models/Quest";
import {checkClaimableResult, claimRewardResult} from "@/lib/quests/types";
import {QuestBase} from "@/lib/quests/implementations/base";
import {AuthorizationType} from "@/lib/authorization/types";


export class ConnectTwitterQuest extends QuestBase {
    constructor(quest: IQuest) {
        super(quest);
    }

    async checkClaimable(userId: string): Promise<checkClaimableResult> {
        // 此处只要用户绑定了twitter账号就行，不强求授权token的有效性
        const userTwitter = await UserTwitter.findOne({user_id: userId, deleted_time: null});
        return {
            claimable: !!userTwitter,
            require_authorization: userTwitter ? undefined : AuthorizationType.Twitter,
        }
    }

    async claimReward(userId: string): Promise<claimRewardResult> {
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
        const result = await this.saveUserReward(userId, taint, rewardDelta);
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


// 返回结构：
//            {
//                 user_id: 1,
//                 twitter_id: 1,
//                 token: "$oauth_tokens"
//             }
export async function queryUserTwitterAuthorization(userId: string): Promise<any> {
    const aggregateQuery: PipelineStage[] = [
        {
            $match: {
                user_id: userId,
                deleted_time: null,
            }
        },
        {
            $lookup: {
                from: "oauth_tokens",
                let: {platform_id: "$twitter_id"},
                pipeline: [
                    // 联表时过滤已删除的记录
                    {$match: {$expr: {$and: [{$eq: ["$platform_id", "$$platform_id"]}, {$eq: ["$deleted_time", null]}]}}}
                ],
                as: "oauth_tokens"
            }
        },
        {
            $unwind: "$oauth_tokens"
        },
        {
            $project: {
                _id: 0,
                user_id: 1,
                twitter_id: 1,
                token: "$oauth_tokens"
            }
        }
    ];
    const results = await UserTwitter.aggregate(aggregateQuery);
    return results.length > 0 ? results[0] : null;
}

// 校验用户是否绑定了twitter
export async function verifyConnectTwitterQuest(userId: string, quest: IQuest): Promise<checkClaimableResult> {
    const twitter = await queryUserTwitterAuthorization(userId);
    return {claimable: !!twitter};
}