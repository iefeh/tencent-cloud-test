import {PipelineStage} from "mongoose";
import UserTwitter from "@/lib/models/UserTwitter";
import {IQuest} from "@/lib/models/Quest";
import {checkClaimableResult} from "@/lib/quests/types";

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