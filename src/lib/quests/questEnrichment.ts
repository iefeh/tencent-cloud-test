import { format } from 'date-fns';
import { ethers } from 'ethers';

import { AuthorizationType } from '@/lib/authorization/types';
import { getUserFirstWhitelist, queryUserAuth } from '@/lib/common/user';
import QuestAchievement from '@/lib/models/QuestAchievement';
import Token from '@/lib/models/Token';
import UserMetrics from '@/lib/models/UserMetrics';
import UserMoonBeamAudit from '@/lib/models/UserMoonBeamAudit';
import UserTokenReward from '@/lib/models/UserTokenReward';
import { constructQuest } from '@/lib/quests/constructor';
import { queryUserDiscordAuthorization } from '@/lib/quests/implementations/connectDiscordQuest';
import { queryUserSteamAuthorization } from '@/lib/quests/implementations/connectSteamQuest';
import { queryUserTelegramAuthorization } from '@/lib/quests/implementations/connectTelegramQuest';
import { queryUserTwitterAuthorization } from '@/lib/quests/implementations/connectTwitterQuest';
import { queryUserWalletAuthorization } from '@/lib/quests/implementations/connectWalletQuest';
import { QuestType } from '@/lib/quests/types';

import TwitterTopicTweet from '../models/TwitterTopicTweet';
import UserTwitter from '../models/UserTwitter';
import { enrichTasksProgress } from './taskEnrichment';
import UserNodeEligibility from '../models/UserNodeEligibility';

// 增强用户的quests，场景：用户任务列表
export async function enrichUserQuests(userId: string, quests: any[]) {
    // 为任务添加verified字段
    await enrichQuestVerification(userId, quests);
    // 为任务添加achieved字段
    await enrichQuestAchievement(userId, quests);
    // 为任务添加authorization、user_authorized字段
    await enrichQuestAuthorization(userId, quests);
    // 为任务添加user_token_reward字段
    await enrichQuestTokenClaimStatus(userId, quests);
    // 为任务添加user_node_reward字段
    await enrichQuestNodeRewardStatus(userId, quests);
    // 丰富任务进度
    await enrichTasksProgress(userId, quests);
    // 丰富任务属性
    await enrichQuestCustomProperty(userId, quests);
}

// 丰富特定于任务的属性，如wallet任务额外返回上次钱包资产同步时间
export async function enrichQuestCustomProperty(userId: string, quests: any[]) {
    // 过滤任务中的property，返回URL与prepare标识
    maskQuestProperty(quests);

    for (let quest of quests) {
        if (quest.type != QuestType.ConnectWallet || !quest.verified) {
            continue;
        }
        if (quest.type === QuestType.ConnectWallet) {
            // 用户已经完成钱包任务，获取钱包资产上次同步时间
            const metrics = await UserMetrics.findOne(
                { user_id: userId },
                { _id: 0, wallet_asset_value_last_refresh_time: 1 },
            );
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
        quest.properties = { url: quest.properties.url };
        // 设置is_prepared标识
        const questImpl = constructQuest(quest);
        quest.properties.is_prepared = questImpl.isPrepared();
    }
}

// 为任务添加verified字段，标识当前用户是否已经校验任务
async function enrichQuestVerification(userId: string, quests: any[]) {
    if (!userId) {
        // 用户未登录，跳过设置
        return;
    }
    // 获取用户已经校验的任务
    const dateStamp = format(Date.now(), 'yyyy-MM-dd');
    let questIds = quests.map((quest) => quest.id);
    questIds = questIds.concat(
        quests.filter((q) => q.type === QuestType.ThinkingDataQuery).map((quest) => `${quest.id},${dateStamp}`),
    ); // 添加2048每日任务完成记录查询
    const verifiedQuests = await UserMoonBeamAudit.find(
        {
            user_id: userId,
            corr_id: { $in: questIds },
            deleted_time: null,
        },
        {
            _id: 0,
            corr_id: 1,
        },
    );
    const verified = new Map<string, boolean>(verifiedQuests.map((q) => [q.corr_id, true]));

    quests.forEach(async (quest) => {
        // 添加任务校验标识
        quest.verified = verified.has(quest.id);
        if (!quest.verified) {
            if (quest.type === QuestType.ThinkingDataQuery) {
                quest.verified = verified.has(`${quest.id},${dateStamp}`);
            }
        }
        // 添加禁止verify标识
        quest.verify_disabled = false;
        // 若已校验，则不再需要判断是否需要启用禁用verify.
        if (!quest.verified) {
            if (quest.type === QuestType.TweetInteraction || quest.type === QuestType.TwitterTopic) {
                let userTwitter = await UserTwitter.findOne({ user_id: userId, deleted_time: null });
                if (userTwitter) {
                    let tweet = await TwitterTopicTweet.findOne({
                        author_id: userTwitter.twitter_id,
                        topic_id: quest.properties.topic_id,
                    });
                    if (!tweet) {
                        quest.verify_disabled = true;
                    }
                }
            }
        }
    });
}

// 为任务添加achieved字段，标识当前用户是否已经达成任务
async function enrichQuestAchievement(userId: string, quests: any[]) {
    if (!userId) {
        // 用户未登录，跳过设置
        return;
    }
    // 检查任务完成标识
    const dateStamp = format(Date.now(), 'yyyy-MM-dd');
    let questIds = quests.map((quest) => quest.id);
    questIds = questIds.concat(
        quests.filter((q) => q.type === QuestType.ThinkingDataQuery).map((quest) => `${quest.id},${dateStamp}`),
    ); // 添加2048每日任务完成记录查询
    const achievedQuests = await QuestAchievement.find(
        {
            user_id: userId,
            quest_id: { $in: questIds },
        },
        { _id: 0, quest_id: 1 },
    );
    const userQuests = new Map<string, boolean>(achievedQuests.map((quest) => [quest.quest_id, true]));
    quests.forEach((quest) => {
        if (quest.achieved) {
            return;
        }
        quest.achieved = userQuests.has(quest.id);
        if (!quest.achieved && quest.type === QuestType.ThinkingDataQuery) {
            quest.achieved = userQuests.has(`${quest.id},${dateStamp}`);
        }
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
            case QuestType.ConnectTelegram:
                const telegram = await queryUserTelegramAuthorization(userId);
                quest.achieved = !!telegram;
                break;
            case QuestType.Whitelist:
                const userWl = await getUserFirstWhitelist(userId, quest.properties.whitelist_id);
                quest.achieved = !!userWl;
                break;
        }
    }
}

// 修改任务中的user_authorized字段，当用户已授权时置为true
async function enrichQuestUserAuthorization(userId: string, quests: any[]) {
    if (!userId) {
        return;
    }
    // 检查用户授权
    const userAuth = await getUserAuth(userId);
    quests.forEach((quest) => {
        if (!quest.authorization) {
            return;
        }
        if (quest.verified) {
            // 任务已校验，无需检查授权
            return;
        }
        quest.user_authorized = userAuth.get(quest.authorization) || false;
    });
}

// 为任务添加user_token_reward字段
async function enrichQuestTokenClaimStatus(userId: string, quests: any[]) {
    await Promise.all(quests.map(async (quest) => {
        // 任务存在token奖励, 查询用户token奖励领取状态
        if (quest.reward.token_reward && quest.verified) {
            const userTokenReward = await UserTokenReward.findOne({ reward_id: ethers.id(`${userId},${quest.id}`)});
            // 用户已验证token奖励, 创建token奖励属性
            if (userTokenReward) {
                quest.user_token_reward = {
                    reward_id: userTokenReward.reward_id,
                    status: userTokenReward.status,
                    source_type: userTokenReward.source_type,
                    token_amount_raw: userTokenReward.token_amount_raw,
                    token_amount_formatted: userTokenReward.token_amount_formatted,
                    created_time: userTokenReward.created_time,
                };
                const token = await Token.findOne({ token_id: userTokenReward.token_id });
                if (token) {
                    quest.user_token_reward.token = {
                        chain_id: token.chain_id,
                        address: token.address,
                        icon: token.icon,
                        name: token.name,
                        symbol: token.symbol,
                        decimal: token.decimal
                    };
                }
            }
        }
    }));
}

async function enrichQuestNodeRewardStatus(userId: string, quests: any[]) {
    await Promise.all(quests.map(async (quest) => {
        // 任务存在raffle node奖励, 查询用户中奖状态
        if (quest.reward.raffle_node && quest.reward.raffle_node.actual_raffle_time && quest.verified) {
            const userNodeEligibility = await UserNodeEligibility.findOne({ source_id: quest.id, user_id: userId});
            if (userNodeEligibility) {
                quest.user_node_reward = {
                    win_reward: true,
                    node_tier: userNodeEligibility.node_tier
                }
            } else {
                quest.user_node_reward = {
                    win_reward: false
                }
            }
        }
    }));
}

async function getUserAuth(userId: string): Promise<Map<AuthorizationType, boolean>> {
    const userAuth = await queryUserAuth(userId);
    return new Map<AuthorizationType, boolean>([
        [AuthorizationType.Twitter, !!userAuth.twitter],
        [AuthorizationType.Discord, !!userAuth.discord],
        [AuthorizationType.Wallet, !!userAuth.wallet],
        [AuthorizationType.Google, !!userAuth.google],
        [AuthorizationType.Steam, !!userAuth.steam],
        [AuthorizationType.Telegram, !!userAuth.telegram],
        [AuthorizationType.Email, !!userAuth.email],
    ]);
}

// 为任务添加authorization、user_authorized字段，标识任务需要的前置授权类型
export async function enrichQuestAuthorization(userId: string, quests: any[]) {
    quests.forEach((quest) => {
        if (quest.verified) {
            // 任务已完成，无需检查授权
            return;
        }
        // 设置任务授权，且默认设置当前用户未授权
        switch (quest.type) {
            case QuestType.ConnectTwitter:
            case QuestType.FollowOnTwitter:
            case QuestType.RetweetTweet:
            case QuestType.LikeTweet:
            case QuestType.CommentTweet:
            case QuestType.TwitterTopic:
            case QuestType.TweetInteraction:
            case QuestType.TwitterFollower:
            case QuestType.FollowOnTwitterNew:
                quest.authorization = AuthorizationType.Twitter;
                quest.user_authorized = false;
                break;
            case QuestType.ConnectDiscord:
            case QuestType.HoldDiscordRole:
            case QuestType.JoinDiscordServer:
            case QuestType.SendDiscordMessage:
                quest.authorization = AuthorizationType.Discord;
                quest.user_authorized = false;
                break;
            case QuestType.ConnectWallet:
            case QuestType.HoldNFT:
                quest.authorization = AuthorizationType.Wallet;
                quest.user_authorized = false;
                break;
            case QuestType.ConnectSteam:
                quest.authorization = AuthorizationType.Steam;
                quest.user_authorized = false;
                break;
            case QuestType.ConnectTelegram:
                quest.authorization = AuthorizationType.Telegram;
                quest.user_authorized = false;
                break;
            default:
                quest.authorization = null;
        }
    });
    // 校正任务中的user_authorized字段，标识用户真实授权情况
    await enrichQuestUserAuthorization(userId, quests);
}
