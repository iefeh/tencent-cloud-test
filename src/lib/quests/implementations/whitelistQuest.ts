import {ConnectTwitterQuest} from "@/lib/quests/implementations/connectTwitterQuest";
import {IQuest} from "@/lib/models/Quest";
import {checkClaimableResult, claimRewardResult, Whitelist} from "@/lib/quests/types";
import {getUserFirstWhitelist} from "@/lib/common/user";
import logger from "@/lib/logger/winstonLogger";

export class WhitelistQuest extends ConnectTwitterQuest {
    constructor(quest: IQuest) {
        super(quest);
    }

    async checkClaimable(userId: string): Promise<checkClaimableResult> {
        const whitelist = this.quest.properties as Whitelist;
        const userWl = await getUserFirstWhitelist(userId, whitelist.whitelist_id);
        return {
            claimable: !!userWl,
        }
    }

    async claimReward(userId: string): Promise<claimRewardResult> {
        // 获取用户的白名单
        const whitelist = this.quest.properties as Whitelist;
        const userWl = await getUserFirstWhitelist(userId, whitelist.whitelist_id);
        if (!userWl) {
            return {
                verified: false,
                tip: "You are not in the reward list."
            }
        }
        // 污染用户的白名单，确保单个白名单只能获取一次奖励
        const taint = `${this.quest.id},${userWl.whitelist_entity_type},${userWl.whitelist_entity_id}`;
        const rewardDelta = await this.checkUserRewardDelta(userId);
        if (!rewardDelta) {
            logger.warn((`user ${userId} quest ${this.quest.id} reward amount zero`));
            return {
                verified: false,
                tip: "No eligible conditions for rewards were found. Please retry with a different account.",
            }
        }
        const result = await this.saveUserReward(userId, taint, rewardDelta, null);
        if (result.duplicated) {
            return {
                verified: false,
                tip: "The reward has already claimed by others.",
            }
        }
        return {
            verified: result.done,
            claimed_amount: result.done ? rewardDelta : undefined,
            tip: result.done ? `You have claimed ${rewardDelta} MB.` : result.tip ? result.tip : "Server Internal Error",
        }
    }
}