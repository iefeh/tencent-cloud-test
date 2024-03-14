import {IQuest} from "@/lib/models/Quest";
import {checkClaimableResult, claimRewardResult} from "@/lib/quests/types";
import {ConnectTwitterQuest} from "@/lib/quests/implementations/connectTwitterQuest";
import {promiseSleep} from "@/lib/common/sleep";
import UserTwitter from "@/lib/models/UserTwitter";
import {AuthorizationType} from "@/lib/authorization/types";


export class CommentTweetQuest extends ConnectTwitterQuest {
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

    async claimReward(userId: string): Promise<claimRewardResult> {
        // 检查用户是否完成任务
        const achieved = await this.checkAchieved(userId);
        if (!achieved) {
            return {
                verified: false,
                tip: "Please comment to complete task first."
            }
        }
        await promiseSleep(2000);
        return super.claimReward(userId);
    }

    isPrepared(): boolean {
        return true;
    }
}