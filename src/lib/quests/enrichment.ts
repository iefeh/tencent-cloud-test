import {QuestType} from "@/lib/models/Quest";
import {AuthorizationType} from "@/lib/models/authentication";
import QuestAchievement from "@/lib/models/QuestAchievement";
import {queryUserWalletAuthorization} from "@/lib/quests/items/connectWallet";
import {queryUserTwitterAuthorization} from "@/lib/quests/items/connectTwitter";
import {queryUserDiscordAuthorization} from "@/lib/quests/items/connectDiscord";
import {queryUserSteamAuthorization} from "@/lib/quests/items/connectSteam";

export async function enrichUserQuests(userId: string, quests: any[]) {
    // 为任务添加verified字段
    await enrichQuestVerification(userId, quests);
    // 为任务添加achieved字段
    await enrichQuestAchievement(userId, quests);
    // 为任务添加authorization、user_authorized字段
    enrichQuestAuthorization(quests);
    // 校正任务中的user_authorized字段，标识用户真实授权情况
    await enrichQuestUserAuthorization(userId, quests);
}

// 为任务添加verified字段，标识当前用户是否已经校验任务
async function enrichQuestVerification(userId: string, quests: any[]) {
    if (!userId) {
        // 用户未登录，跳过设置
        return;
    }
    // 获取用户已经校验的任务
    const questIds = quests.map(quest => quest.id);
    const achievedQuests = await QuestAchievement.find({user_id: userId, quest_id: {$in: questIds}}, {
        _id: 0,
        quest_id: 1
    });
    const achievements = new Map<string, boolean>();
    achievedQuests.forEach(q => achievements.set(q.quest_id, true));
    // 添加任务校验标识
    quests.forEach(quest => quest.verified = achievements.has(quest.id));
}

// 为任务添加achieved字段，标识当前用户是否已经达成任务
async function enrichQuestAchievement(userId: string, quests: any[]) {
    if (!userId) {
        // 用户未登录，跳过设置
        return;
    }
    // 理论不会出现多个连接任务，此处直接在循环内部查询.
    for (const quest of quests) {
        if (quest.achieved || quest.verified) {
            continue;
        }
        switch (quest.type) {
            case QuestType.ConnectWallet:
                // 检查用户当前是否已连接钱包
                const wallet = await queryUserWalletAuthorization(userId);
                quest.achieved = !!wallet;
                break;
            case QuestType.ConnectTwitter:
                const twitter = await queryUserTwitterAuthorization(userId);
                quest.achieved = !!twitter;
                break;
            case QuestType.ConnectDiscord:
                const discord = await queryUserDiscordAuthorization(userId);
                quest.achieved = !!discord;
                break;
            case QuestType.ConnectSteam:
                const steam = await queryUserSteamAuthorization(userId);
                quest.achieved = !!steam;
        }
    }
}


// 修改任务中的user_authorized字段，当用户已授权时置为true
async function enrichQuestUserAuthorization(userId: string, quests: any[]) {
    if (!userId) {
        return;
    }
    // 检查需要执行的授权检查
    let checkDiscord = false;
    let checkTwitter = false;
    let checkWallet = false;
    quests.forEach(quest => {
        if (quest.achieved || quest.verified) {
            // 任务已完成，无需检查授权
            return;
        }
        switch (quest.authorization) {
            case AuthorizationType.Twitter:
                checkTwitter = true;
                break;
            case AuthorizationType.Discord:
                checkDiscord = true;
                break;
            case AuthorizationType.Wallet:
                checkWallet = true;
                break;
        }
    });
    // 检查用户授权
    const authorized = new Map<AuthorizationType, boolean>();
    if (checkWallet) {
        const walletAuth = await queryUserWalletAuthorization(userId);
        authorized.set(AuthorizationType.Wallet, !!walletAuth)
    }
    if (checkDiscord) {
        const discordAuth = await queryUserDiscordAuthorization(userId);
        authorized.set(AuthorizationType.Discord, discordAuth && discordAuth.token)
    }
    if (checkTwitter) {
        const twitterAuth = await queryUserTwitterAuthorization(userId);
        authorized.set(AuthorizationType.Twitter, twitterAuth && twitterAuth.token)
    }
    quests.forEach(quest => {
        if (quest.achieved || quest.verified) {
            // 任务已完成，无需检查授权
            return;
        }
        switch (quest.type) {
            case QuestType.FollowOnTwitter:
            case QuestType.RetweetTweet:
                quest.user_authorized = authorized.get(AuthorizationType.Twitter);
                break;
            case QuestType.HoldDiscordRole:
                quest.user_authorized = authorized.get(AuthorizationType.Discord);
                break;
            case QuestType.HoldNFT:
                quest.user_authorized = authorized.get(AuthorizationType.Wallet);
                break;
        }
    });
}

// 为任务添加authorization、user_authorized字段，标识任务需要的前置授权类型
function enrichQuestAuthorization(quests: any[]) {
    quests.forEach(quest => {
        if (quest.achieved || quest.verified) {
            // 任务已完成，无需检查授权
            return;
        }
        // 设置任务授权，且默认设置当前用户未授权
        switch (quest.type) {
            case QuestType.FollowOnTwitter:
            case QuestType.RetweetTweet:
                quest.authorization = AuthorizationType.Twitter;
                quest.user_authorized = false;
                break;
            case QuestType.HoldDiscordRole:
                quest.authorization = AuthorizationType.Discord;
                quest.user_authorized = false;
                break;
            case QuestType.HoldNFT:
                quest.authorization = AuthorizationType.Wallet;
                quest.user_authorized = false;
                break;
            default:
                quest.authorization = null;
        }
    })
}