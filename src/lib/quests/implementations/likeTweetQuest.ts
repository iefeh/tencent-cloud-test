import { IQuest } from "@/lib/models/Quest";
import { checkClaimableResult, claimRewardResult, LikeTweet } from "@/lib/quests/types";
import { queryUserTwitterAuthorization, UserTwitterAuthorization } from "@/lib/quests/implementations/connectTwitterQuest";
import { AuthorizationType } from "@/lib/authorization/types";
import { twitterOAuthProvider } from "@/lib/authorization/provider/twitter";
import { isAxiosError } from "axios";
import { deleteAuthToken } from "@/lib/authorization/provider/util";
import { redis } from "@/lib/redis/client";
import { QuestBase } from "@/lib/quests/implementations/base";
import logger from "@/lib/logger/winstonLogger";
import UserMetrics, { Metric } from "@/lib/models/UserMetrics";
import { sendBadgeCheckMessage } from "@/lib/kafka/client";
import { tr } from "date-fns/locale";


export class LikeTweetQuest extends QuestBase {
    constructor(quest: IQuest) {
        super(quest);
    }

    static async likeTweet(twitterAuth: UserTwitterAuthorization, tweetId: string): Promise<{ liked: boolean, require_authorization: boolean }> {
        // 检查是否限流
        const rateLimitedKey = `twitter_like:${twitterAuth.twitter_id}`;
        const rateLimited = await redis.get(rateLimitedKey);
        if (rateLimited) {
            logger.warn(`user ${twitterAuth.user_id} twitter ${twitterAuth.twitter_id} like limited by redis`);
            return {
                liked: false,
                require_authorization: false,
            }
        }
        // 以用户名义执行点赞推文
        const twitterRequest = twitterOAuthProvider.createRequest(twitterAuth.token);
        const likeTweetURL = `https://api.twitter.com/2/users/${twitterAuth.twitter_id}/likes`;
        // { data: { liked: true } }，重复点赞不会报错，依然返回该结果
        try {
            await twitterRequest.post(likeTweetURL, {
                tweet_id: tweetId,
            });
            return {
                liked: true,
                require_authorization: false,
            }
        } catch (error) {
            logger.error(`user ${twitterAuth.user_id} twitter ${twitterAuth.twitter_id} like error: ${error}`);
            if (!isAxiosError(error)) {
                return {
                    liked: false,
                    require_authorization: false,
                };
            }
            // 检查请求响应
            const response = error.response!;
            // 当前无权限，移除用户的授权token
            if (response.status === 403 || response.data.error_description == "Value passed for the token was invalid.") {
                logger.warn(`user ${twitterAuth.user_id} twitter ${twitterAuth.twitter_id} like invalidated: ${JSON.stringify(response.data)}`);
                await deleteAuthToken(twitterAuth.token);
                return {
                    liked: false,
                    require_authorization: true,
                };
            }
            // 当前是否已经被限流，需要添加限流处理
            if (response.status === 429) {
                logger.warn(`user ${twitterAuth.user_id} twitter ${twitterAuth.twitter_id} like rate limited: ${JSON.stringify(response.data)}`);
                const resetAt = response.headers["x-rate-limit-reset"];
                if (resetAt) {
                    const wait = Number(resetAt) - Math.ceil(Date.now() / 1000);
                    if (wait) {
                        await redis.setex(rateLimitedKey, wait, 1);
                    };
                }
            }
            return {
                liked: false,
                require_authorization: false,
            }
        }
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
        const questProp = this.quest.properties as LikeTweet;
        const likeResult = await LikeTweetQuest.likeTweet(twitterAuth, questProp.tweet_id);
        let tip = "";
        if (!likeResult.liked) {
            tip = "Something wrong, please try again later.";
        }
        if (likeResult.require_authorization) {
            tip = "You should connect your Twitter Account first.";
        }
        return {
            claimable: likeResult.liked,
            require_authorization: likeResult.require_authorization ? AuthorizationType.Twitter : undefined,
            tip: tip,
            extra: twitterAuth.twitter_id,
        }
    }

    async addUserAchievement<T>(userId: string, verified: boolean, extraTxOps: (session: any) => Promise<T> = () => Promise.resolve(<T>{})): Promise<void> {
        await super.addUserAchievement(userId, verified, async (session) => {
            await UserMetrics.updateOne(
                { user_id: userId },
                {
                    $set: { [Metric.TwitterConnected]: 1 },
                    $setOnInsert: {
                        created_time: Date.now(),
                    },
                },
                { upsert: true, session: session },
            );
        });
        await sendBadgeCheckMessage(userId, Metric.TwitterConnected);
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
        await sendBadgeCheckMessage(userId, Metric.TwitterConnected);
        return {
            verified: result.done,
            claimed_amount: result.done ? rewardDelta : undefined,
            tip: result.done ? `You have claimed ${rewardDelta} MB.` : "Server Internal Error",
        }
    }
}