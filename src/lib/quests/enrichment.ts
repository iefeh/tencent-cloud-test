import QuestAchievement from "@/lib/models/QuestAchievement";
import {queryUserWalletAuthorization} from "@/lib/quests/implementations/connectWalletQuest";
import {queryUserTwitterAuthorization} from "@/lib/quests/implementations/connectTwitterQuest";
import {queryUserDiscordAuthorization} from "@/lib/quests/implementations/connectDiscordQuest";
import {queryUserSteamAuthorization} from "@/lib/quests/implementations/connectSteamQuest";
import {AuthorizationType} from "@/lib/authorization/types";
import {QuestType} from "@/lib/quests/types";
import UserMetrics from "@/lib/models/UserMetrics";
import UserMoonBeamAudit from "@/lib/models/UserMoonBeamAudit";

export async function enrichUserQuests(userId: string, quests: any[]) {
    // 为任务添加verified字段
    await enrichQuestVerification(userId, quests);
    // 为任务添加achieved字段
    await enrichQuestAchievement(userId, quests);
    // 为任务添加authorization、user_authorized字段
    enrichQuestAuthorization(quests);
    // 校正任务中的user_authorized字段，标识用户真实授权情况
    await enrichQuestUserAuthorization(userId, quests);
    // 过滤任务中的property，仅返回URL
    filterQuestProperty(quests);
    // 丰富任务属性
    await enrichQuestCustomProperty(userId, quests);
}

// 丰富特定于任务的属性，如wallet任务额外返回上次钱包资产同步时间
async function enrichQuestCustomProperty(userId: string, quests: any[]) {
    for (let quest of quests) {
        if (quest.type != QuestType.ConnectWallet || !quest.verified) {
            continue
        }
        // 用户已经完成钱包任务，获取钱包资产上次同步时间
        const metrics = await UserMetrics.findOne({user_id: userId}, {_id: 0, wallet_asset_value_last_refresh_time: 1});
        // 用服务器时间进行校验行为矫正
        const reverifyAt = Number(metrics.wallet_asset_value_last_refresh_time) + 12 * 60 * 60 * 1000;
        let reverifyAfter = reverifyAt - Date.now();
        reverifyAfter = reverifyAfter > 0 ? reverifyAfter : 0;
        if (quest.properties) {
            quest.properties.last_verified_time = metrics.wallet_asset_value_last_refresh_time;
            quest.properties.can_reverify_after = reverifyAfter;
        } else {
            quest.properties = {
                last_verified_time: metrics.wallet_asset_value_last_refresh_time,
                can_reverify_after: reverifyAfter,
            };
        }
    }
}

// 过滤任务中的property，仅返回URL
function filterQuestProperty(quests: any[]) {
    for (let quest of quests) {
        if (!quest.properties) {
            continue
        }
        quest.properties = {url: quest.properties.url}
    }
}

// 为任务添加verified字段，标识当前用户是否已经校验任务
async function enrichQuestVerification(userId: string, quests: any[]) {
    if (!userId) {
        // 用户未登录，跳过设置
        return;
    }
    // 获取用户已经校验的任务
    const questIds = quests.map(quest => quest.id);
    const verifiedQuests = await UserMoonBeamAudit.find({
        user_id: userId,
        corr_id: {$in: questIds},
        deleted_time: null
    }, {
        _id: 0,
        quest_id: "$corr_id"
    });
    const achievements = new Map<string, boolean>();
    verifiedQuests.forEach(q => achievements.set(q.quest_id, true));
    // 添加任务校验标识
    quests.forEach(quest => quest.verified = achievements.has(quest.id));
}

// 为任务添加achieved字段，标识当前用户是否已经达成任务
async function enrichQuestAchievement(userId: string, quests: any[]) {
    if (!userId) {
        // 用户未登录，跳过设置
        return;
    }
    // 检查任务是否完成
    const checkAchievementsQuestIds = [];
    for (const quest of quests) {
        if (quest.verified) {
            quest.achieved = true;
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
                break;
            default:
                // 默认当前任务未完成，待后续进行检查
                quest.achieved = false;
                checkAchievementsQuestIds.push(quest.id);
        }
    }
    // 检查是否有任务完成标识
    if (checkAchievementsQuestIds.length == 0) {
        return;
    }
    const achievedQuests = await QuestAchievement.find({
        user_id: userId,
        quest_id: {$in: checkAchievementsQuestIds}
    }, {_id: 0, quest_id: 1});
    if (!achievedQuests || achievedQuests.length == 0) {
        return;
    }
    const userQuests = new Map<string, boolean>(achievedQuests.map(quest => [quest.quest_id, true]));
    quests.forEach(quest => {
        if (quest.achieved) {
            return;
        }
        quest.achieved = userQuests.get(quest.id);
    })
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
        authorized.set(AuthorizationType.Discord, !!discordAuth && !!discordAuth.token)
    }
    if (checkTwitter) {
        const twitterAuth = await queryUserTwitterAuthorization(userId);
        authorized.set(AuthorizationType.Twitter, !!twitterAuth && !!twitterAuth.token)
    }
    quests.forEach(quest => {
        if (quest.verified) {
            // 任务已校验，无需检查授权
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