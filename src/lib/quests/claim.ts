import {IQuest} from "@/lib/models/Quest";
import {QuestType, claimRewardResult} from "@/lib/quests/types";
import logger from "@/lib/logger/winstonLogger";
import {QuestBase} from "@/lib/quests/implementations/base";
import {ConnectTwitterQuest} from "@/lib/quests/implementations/connectTwitterQuest";
import {ConnectDiscordQuest} from "@/lib/quests/implementations/connectDiscordQuest";
import {HoldDiscordRoleQuest} from "@/lib/quests/implementations/holdDiscordRoleQuest";
import {UserMetricQuest} from "@/lib/quests/implementations/userMetricQuest";
import {FollowOnTwitterQuest} from "@/lib/quests/implementations/followOnTwitterQuest";
import {RetweetTweetQuest} from "@/lib/quests/implementations/retweetTweetQuest";
import {ConnectSteamQuest} from "@/lib/quests/implementations/connectSteamQuest";
import {ConnectWalletQuest} from "@/lib/quests/implementations/connectWalletQuest";

// TODO: 可以在checkClaim时完成用户指标的整理(如果存在)，然后在claim时如果奖励是范围，查询对应奖励的所在位置.
//       动态奖励集合：存放奖励id，奖励的前置条件，奖励的额度.
export async function claimQuestReward(userId: string, quest: IQuest): Promise<claimRewardResult> {
    let baseQuest: QuestBase | undefined;
    switch (quest.type) {
        case QuestType.ConnectWallet:
            baseQuest = new ConnectWalletQuest(quest)
            break;
        case QuestType.ConnectDiscord:
            baseQuest = new ConnectDiscordQuest(quest)
            break;
        case QuestType.FollowOnTwitter:
            baseQuest = new FollowOnTwitterQuest(quest)
            break;
        case QuestType.RetweetTweet:
            baseQuest = new RetweetTweetQuest(quest)
            break;
        case QuestType.ConnectTwitter:
            baseQuest = new ConnectTwitterQuest(quest)
            break;
        case QuestType.ConnectSteam:
            baseQuest = new ConnectSteamQuest(quest)
            break;
        case QuestType.HoldDiscordRole:
            baseQuest = new HoldDiscordRoleQuest(quest)
            break;
        case QuestType.Whitelist:
            break;
        case QuestType.UserMetric:
            baseQuest = new UserMetricQuest(quest)
            break;
        case QuestType.HoldNFT:
            break;
        default:
            logger.error(`quest ${quest.id} type ${quest.type} not implemented`);
            return {verified: false}
    }
    if (!baseQuest) {
        logger.error(`base quest not initialized`);
        return {verified: false}
    }
    return baseQuest.claimReward(userId);
}