import {IQuest, QuestType} from "@/lib/models/Quest";
import logger from "@/lib/logger/winstonLogger";
import {queryUserWalletAuthorization, verifyConnectWalletQuest} from "@/lib/quests/items/connectWallet";
import {queryUserTwitterAuthorization, verifyConnectTwitterQuest} from "@/lib/quests/items/connectTwitter";
import {queryUserDiscordAuthorization, verifyConnectDiscordQuest} from "@/lib/quests/items/connectDiscord";
import {queryUserSteamAuthorization, verifyConnectSteamQuest} from "@/lib/quests/items/connectSteam";
import {AuthorizationType} from "@/lib/models/authentication";
import {verifyQuestResult} from "@/lib/quests/types";

// 检查用户是否完成特定类型任务
export async function verifyUserQuest(userId: string, quest: IQuest): Promise<verifyQuestResult> {
    switch (quest.type) {
        case QuestType.ConnectWallet:
            return verifyConnectWalletQuest(userId, quest);
        case QuestType.ConnectTwitter:
            return verifyConnectTwitterQuest(userId, quest);
        case QuestType.ConnectDiscord:
            return verifyConnectDiscordQuest(userId, quest);
        case QuestType.ConnectTelegram:
            return {claimable: false};
        case QuestType.ConnectSteam:
            return verifyConnectSteamQuest(userId, quest);
        case QuestType.FollowOnTwitter:
        case QuestType.RetweetTweet:
            return verifyTwitterQuest(userId, quest);
        case QuestType.HoldDiscordRole:
            break;
        case QuestType.Whitelist:
            break;
        case QuestType.GamePreRegister:
            break;
        case QuestType.HoldNFT:
            break;
        default:
            logger.error(`quest ${quest.id} type ${quest.type} not implemented`);
    }
    return {claimable: false};
}

async function verifyTwitterQuest(userId: string, quest: IQuest): Promise<verifyQuestResult> {
    // 需要twitter绑定
    const twitterAuth = await queryUserTwitterAuthorization(userId);
    if (!twitterAuth) {
        return {claimable: false, require_authorization: AuthorizationType.Twitter};
    }
    // 伪验证，等待1秒
    await promiseSleep(1200);
    return {claimable: true};
}