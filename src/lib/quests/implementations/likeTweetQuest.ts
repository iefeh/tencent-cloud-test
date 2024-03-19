import {IQuest} from "@/lib/models/Quest";
import {checkClaimableResult, claimRewardResult, LikeTweet} from "@/lib/quests/types";
import {queryUserTwitterAuthorization} from "@/lib/quests/implementations/connectTwitterQuest";
import {AuthorizationType} from "@/lib/authorization/types";
import {twitterOAuthProvider} from "@/lib/authorization/provider/twitter";
import {isAxiosError} from "axios";
import {deleteAuthToken} from "@/lib/authorization/provider/util";
import {redis} from "@/lib/redis/client";
import {QuestBase} from "@/lib/quests/implementations/base";
import logger from "@/lib/logger/winstonLogger";


export class LikeTweetQuest extends QuestBase {
    constructor(quest: IQuest) {
        super(quest);
    }

    async checkClaimable(userId: string): Promise<checkClaimableResult> {
        // 要求用户绑定了twitter账号且目前授权token有效
        const twitterAuth = await queryUserTwitterAuthorization(userId);
        if (!twitterAuth) {
            return {
                claimable: false,
                require_authorization: AuthorizationType.Twitter,
            }
        }
        // 检查是否限流
        const rateLimitedKey = `twitter_like:${twitterAuth.twitter_id}`;
        const rateLimited = await redis.get(rateLimitedKey);
        if (rateLimited) {
            logger.warn(`user ${userId} twitter ${twitterAuth.twitter_id} like limited by redis`);
            return {
                claimable: false,
                tip: "Network busy, please try again later."
            }
        }
        // 以用户名义执行点赞推文
        const questProp = this.quest.properties as LikeTweet;
        const twitterRequest = twitterOAuthProvider.createRequest(twitterAuth.token);
        const likeTweetURL = `https://api.twitter.com/2/users/${twitterAuth.twitter_id}/likes`;
        // { data: { liked: true } }，重复点赞不会报错，依然返回该结果
        try {
            await twitterRequest.post(likeTweetURL, {
                tweet_id: questProp.tweet_id,
            });
            return {
                claimable: true,
                // 把用户的twitter id返回，用于后续的奖励计算
                extra: twitterAuth.twitter_id,
            }
        } catch (error) {
            if (!isAxiosError(error)) {
                throw error;
            }
            // 检查转推响应
            const response = error.response!;
            // 当前无权限，移除用户的授权token
            if (response.status === 403 || response.data.error_description == "Value passed for the token was invalid.") {
                logger.warn(`user ${userId} twitter ${twitterAuth.twitter_id} like invalidated: ${JSON.stringify(response.data)}`);
                await deleteAuthToken(twitterAuth.token);
                return {
                    claimable: false,
                    require_authorization: AuthorizationType.Twitter,
                    tip: "You should connect your Twitter Account first."
                }
            }
            // 当前是否已经被限流，需要添加限流处理
            if (response.status === 429) {
                logger.warn(`user ${userId} twitter ${twitterAuth.twitter_id} like rate limited: ${JSON.stringify(response.data)}`);
                const resetAt = response.headers["x-rate-limit-reset"];
                if (resetAt) {
                    const wait = Number(resetAt) - Math.ceil(Date.now() / 1000);
                    if (wait) {
                        await redis.setex(rateLimitedKey, wait, 1);
                    }
                }
                return {
                    claimable: false,
                    tip: "Network busy, please try again later."
                }
            }
            throw error;
        }
    }

    async claimReward(userId: string): Promise<claimRewardResult> {
        const claim = await this.checkClaimable(userId);
        if (!claim.claimable) {
            return {
                verified: claim.claimable,
                require_authorization: claim.require_authorization,
                tip: claim.tip,
            };
        }
        // 污染twitter，确保同一个twitter单任务只能获取一次奖励
        const taint = `${this.quest.id},${AuthorizationType.Twitter},${claim.extra}`;
        const rewardDelta = await this.checkUserRewardDelta(userId);
        const result = await this.saveUserReward(userId, taint, rewardDelta, null);
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
}