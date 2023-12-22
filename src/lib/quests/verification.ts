import {IQuest} from "@/lib/models/Quest";
import logger from "@/lib/logger/winstonLogger";
import {verifyConnectWalletQuest} from "@/lib/quests/implementations/connectWallet";
import {queryUserTwitterAuthorization, verifyConnectTwitterQuest} from "@/lib/quests/implementations/connectTwitter";
import {verifyConnectDiscordQuest} from "@/lib/quests/implementations/connectDiscord";
import {verifyConnectSteamQuest} from "@/lib/quests/implementations/connectSteam";
import {QuestType, checkClaimableResult} from "@/lib/quests/types";
import {AuthorizationType} from "@/lib/authorization/types";
import {verifyHoldDiscordRoleQuest} from "@/lib/quests/implementations/holdDiscordRole";

// 检查用户是否可以申请特定任务
export async function checkUserQuestClaimable(userId: string, quest: IQuest): Promise<checkClaimableResult> {
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
            return verifyHoldDiscordRoleQuest(userId, quest);
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

async function verifyTwitterQuest(userId: string, quest: IQuest): Promise<checkClaimableResult> {
    // 需要twitter绑定
    const twitterAuth = await queryUserTwitterAuthorization(userId);
    if (!twitterAuth) {
        return {claimable: false, require_authorization: AuthorizationType.Twitter};
    }
    // 伪验证，等待1秒
    await promiseSleep(1200);
    return {claimable: true};
}