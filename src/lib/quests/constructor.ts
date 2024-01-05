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
import {WhitelistQuest} from "@/lib/quests/implementations/whitelistQuest";

// TODO: 可以在checkClaim时完成用户指标的整理(如果存在)，然后在claim时如果奖励是范围，查询对应奖励的所在位置.
//       动态奖励集合：存放奖励id，奖励的前置条件，奖励的额度.
export function constructQuest(quest: IQuest): QuestBase {
    switch (quest.type) {
        case QuestType.ConnectWallet:
            return new ConnectWalletQuest(quest);
        case QuestType.ConnectDiscord:
            return new ConnectDiscordQuest(quest);
        case QuestType.FollowOnTwitter:
            return new FollowOnTwitterQuest(quest);
        case QuestType.RetweetTweet:
            return new RetweetTweetQuest(quest);
        case QuestType.ConnectTwitter:
            return new ConnectTwitterQuest(quest);
        case QuestType.ConnectSteam:
            return new ConnectSteamQuest(quest);
        case QuestType.HoldDiscordRole:
            return new HoldDiscordRoleQuest(quest);
        case QuestType.UserMetric:
            return new UserMetricQuest(quest);
        case QuestType.Whitelist:
            return new WhitelistQuest(quest);
        case QuestType.HoldNFT:
        default:
            throw new Error(`quest ${quest.id} type ${quest.type} not implemented`);
    }
}