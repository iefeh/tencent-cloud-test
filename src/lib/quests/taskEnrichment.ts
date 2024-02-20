import QuestAchievement from "@/lib/models/QuestAchievement";
import {queryUserWalletAuthorization} from "@/lib/quests/implementations/connectWalletQuest";
import {queryUserTwitterAuthorization} from "@/lib/quests/implementations/connectTwitterQuest";
import {queryUserDiscordAuthorization} from "@/lib/quests/implementations/connectDiscordQuest";
import {queryUserSteamAuthorization} from "@/lib/quests/implementations/connectSteamQuest";
import {QuestType} from "@/lib/quests/types";
import {getUserFirstWhitelist} from "@/lib/common/user";
import {constructQuest} from "@/lib/quests/constructor";
import {enrichQuestAuthorization} from "@/lib/quests/questEnrichment";

// 增强用户的tasks，场景：活动详情
// 与enrichUserQuests的区别在于，tasks校验任务不给与奖励，quests校验任务给与奖励
// 所以tasks只要任务达成记录即算作已校验.
export async function enrichUserTasks(userId: string, tasks: any[], claimed: boolean) {
    if (!tasks || tasks.length == 0) {
        return;
    }
    // 为任务添加verified字段
    await enrichTaskVerification(userId, tasks, claimed);
    // 为任务添加authorization、user_authorized字段
    await enrichTaskAuthorization(userId, tasks, claimed);
    // 过滤任务属性
    maskQuestProperty(tasks);
}

// 过滤任务中的property，返回URL与prepare标识
// URL是用户完成任务的地址，prepare标识任务可以通过上报完成
function maskQuestProperty(quests: any[]) {
    for (let quest of quests) {
        // 如果quest.properties不存在，则初始化为一个空对象
        if (!quest.properties) {
            quest.properties = {};
        }
        // 只保留url属性
        quest.properties = {url: quest.properties.url};
        // 设置is_prepared标识
        const questImpl = constructQuest(quest)
        quest.properties.is_prepared = questImpl.isPrepared();
        // 设置当前任务的开始标识
        quest.started = true;
        if (quest.start_time && quest.start_time > Date.now()) {
            quest.started = false;
            quest.started_after = quest.start_time - Date.now();
        }
    }
}

// 为任务添加achieved、verified字段，标识当前用户是否已经校验任务
async function enrichTaskVerification(userId: string, quests: any[], claimed: boolean) {
    // 默认任务未达成、未校验
    quests.forEach(quest => {
        quest.achieved = false;
        quest.verified = false;
    });
    if (!userId) {
        // 用户未登录，跳过设置
        return;
    }
    if (claimed) {
        // 活动奖励已经领取，所有任务已达成、已校验
        quests.forEach(quest => {
            quest.achieved = true;
            quest.verified = true;
        });
        return;
    }
    // 获取用户已经校验的任务
    const questIds = quests.map(quest => quest.id);
    const verifiedQuests = await QuestAchievement.find({
        user_id: userId,
        quest_id: {$in: questIds},
    }, {
        _id: 0,
        quest_id: 1,
        verified_time: 1,
    });
    const verified = new Map<string, any>(verifiedQuests.map(q => [q.quest_id, q]));
    // 添加任务校验标识
    quests.forEach(quest => {
        const verifiedQuest = verified.get(quest.id);
        quest.achieved = !!verifiedQuest;
        quest.verified = quest.achieved && !!verifiedQuest.verified_time;
    });
    // 手动检查特殊任务类型完成标识.
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
            case QuestType.Whitelist:
                const userWl = await getUserFirstWhitelist(userId, quest.properties.whitelist_id);
                quest.achieved = !!userWl;
                break;
        }
    }
}

// 为任务添加authorization、user_authorized字段，标识任务需要的前置授权类型
async function enrichTaskAuthorization(userId: string, quests: any[], claimed: boolean) {
    if (claimed) {
        // 用户已经领取奖励，不需要检查授权
        return;
    }
    return enrichQuestAuthorization(userId, quests);
}

