import {PipelineStage} from "mongoose";
import UserDiscord from "@/lib/models/UserDiscord";
import {IQuest} from "@/lib/models/Quest";
import {checkClaimableResult, claimRewardResult} from "@/lib/quests/types";
import {QuestBase} from "@/lib/quests/implementations/base";
import {AuthorizationType} from "@/lib/authorization/types";

export class ConnectDiscordQuest extends QuestBase {
    constructor(quest: IQuest) {
        super(quest);
    }

    async checkClaimable(userId: string): Promise<checkClaimableResult> {
        // 此处只要用户绑定了discord账号就行，不强求授权token的有效性
        const userDiscord = await UserDiscord.findOne({user_id: userId, deleted_time: null});
        return {
            claimable: !!userDiscord,
            require_authorization: userDiscord ? undefined : AuthorizationType.Discord,
        }
    }

    async claimReward(userId: string): Promise<claimRewardResult> {
        const claimableResult = await this.checkClaimable(userId);
        if (!claimableResult.claimable) {
            return {
                claimed: false,
                require_authorization: claimableResult.require_authorization,
            }
        }
        // 领取用户奖励
        return {claimed: false}
    }
}


// 返回结构：
//            {
//                 user_id: 1,
//                 discord_id: 1,
//                 token: "$oauth_tokens"
//             }
export async function queryUserDiscordAuthorization(userId: string): Promise<any> {
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
                let: {platform_id: "$discord_id"},
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
                discord_id: 1,
                token: "$oauth_tokens"
            }
        }
    ];
    const results = await UserDiscord.aggregate(aggregateQuery);
    return results.length > 0 ? results[0] : null;
}

// 校验用户是否绑定了discord
export async function verifyConnectDiscordQuest(userId: string, quest: IQuest): Promise<checkClaimableResult> {
    const discord = await queryUserDiscordAuthorization(userId);
    return {claimable: !!discord};
}