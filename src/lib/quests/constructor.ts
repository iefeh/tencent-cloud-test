import {IQuest} from "@/lib/models/Quest";
import {QuestType} from "@/lib/quests/types";
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
import {JoinDiscordServerQuest} from "@/lib/quests/implementations/joinDiscordServerQuest";
import {HoldNFTQuest} from "@/lib/quests/implementations/holdNFTQuest";

// 根据quest的type构造对应的quest实例
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
        case QuestType.JoinDiscordServer:
            return new JoinDiscordServerQuest(quest);
        case QuestType.HoldDiscordRole:
            return new HoldDiscordRoleQuest(quest);
        case QuestType.UserMetric:
            return new UserMetricQuest(quest);
        case QuestType.Whitelist:
            return new WhitelistQuest(quest);
        case QuestType.HoldNFT:
            return new HoldNFTQuest(quest);
        default:
            throw new Error(`quest ${quest.id} type ${quest.type} not implemented`);
    }
}