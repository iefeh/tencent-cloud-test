import {PipelineStage} from "mongoose";
import UserDiscord from "@/lib/models/UserDiscord";
import {IQuest} from "@/lib/models/Quest";
import {checkClaimableResult, claimRewardResult} from "@/lib/quests/types";
import {QuestBase} from "@/lib/quests/implementations/base";
import {AuthorizationType} from "@/lib/authorization/types";

export class ConnectDiscordQuest extends QuestBase {
    // 用户的授权discord_id，在checkClaimable()时设置
    protected user_discord_id = "";

    constructor(quest: IQuest) {
        super(quest);
    }

    async checkClaimable(userId: string): Promise<checkClaimableResult> {
        // 此处只要用户绑定了discord账号就行，不强求授权token的有效性
        const userDiscord = await UserDiscord.findOne({user_id: userId, deleted_time: null});
        this.user_discord_id = userDiscord?.discord_id;
        return {
            claimable: !!userDiscord,
            require_authorization: userDiscord ? undefined : AuthorizationType.Discord,
        }
    }

    async claimReward(userId: string): Promise<claimRewardResult> {
        const claimableResult = await this.checkClaimable(userId);
        if (!claimableResult.claimable) {
            return {
                verified: false,
                require_authorization: claimableResult.require_authorization,
                tip: claimableResult.require_authorization ? "You should connect your Discord Account first." : undefined,
            }
        }
        // 污染discord，确保同一个discord单任务只能获取一次奖励
        const taint = `${this.quest.id},${AuthorizationType.Discord},${this.user_discord_id}`;
        const rewardDelta = await this.checkUserRewardDelta(userId);
        const result = await this.saveUserReward(userId, taint, rewardDelta);
        if (result.duplicated) {
            return {
                verified: false,
                tip: "The Discord Account has already claimed reward.",
            }
        }
        return {verified: result.done, claimed_amount: result.done ? rewardDelta : undefined, tip: ``}
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