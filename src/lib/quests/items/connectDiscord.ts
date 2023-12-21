import {PipelineStage} from "mongoose";
import UserDiscord from "@/lib/models/UserDiscord";
import {IQuest} from "@/lib/models/Quest";
import {verifyQuestResult} from "@/lib/quests/types";
import {queryUserTwitterAuthorization} from "@/lib/quests/items/connectTwitter";

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
export async function verifyConnectDiscordQuest(userId: string, quest: IQuest): Promise<verifyQuestResult> {
    const discord = await queryUserDiscordAuthorization(userId);
    return {claimable: !!discord, auth_token: !!discord ? discord.token : null};
}