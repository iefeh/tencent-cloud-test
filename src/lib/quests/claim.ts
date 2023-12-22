// 用户通过了任务检查，直接申领任务奖励
import {IQuest} from "@/lib/models/Quest";
import {QuestRewardType, QuestType, checkClaimableResult} from "@/lib/quests/types";
import QuestAchievement from "@/lib/models/QuestAchievement";
import {AuthorizationType} from "@/lib/authorization/types";
import UserMoonBeamAudit, {UserMoonBeamAuditType} from "@/lib/models/UserMoonBeamAudit";
import doTransaction from "@/lib/mongodb/transaction";
import User from "@/lib/models/User";

export async function claimUserQuest(userId: string, quest: IQuest, verifyResult: checkClaimableResult) {
    if (quest.reward.type == QuestRewardType.Fixed) {
        await claimFixedRewardQuest(userId, quest, verifyResult);
        return;
    }
}

// 申领固定任务奖励
async function claimFixedRewardQuest(userId: string, quest: IQuest, verifyResult: checkClaimableResult) {
    let taint = '';
    // switch (quest.type) {
    //     case QuestType.ConnectWallet:
    //     case QuestType.HoldNFT:
    //         // 按 任务/钱包 进行污染，防止同一个钱包多次获得该任务奖励
    //         taint = `${quest.id},${AuthorizationType.Wallet},${verifyResult.wallet?.wallet_addr}`
    //         break;
    //     case QuestType.ConnectTwitter:
    //     case QuestType.FollowOnTwitter:
    //     case QuestType.RetweetTweet:
    //         // 按 任务/twitter id 进行污染，防止同一个twitter账号多次获得该任务奖励
    //         taint = `${quest.id},${AuthorizationType.Twitter},${verifyResult.twitter?.twitter_id}`
    //         break;
    //     case QuestType.ConnectDiscord:
    //     case QuestType.HoldDiscordRole:
    //         // 按 任务/discord id 进行污染，防止同一个discord账号多次获得该任务奖励
    //         taint = `${quest.id},${AuthorizationType.Discord},${verifyResult.discord?.discord_id}`
    //         break;
    //     case QuestType.ConnectTelegram:
    //         break;
    //     case QuestType.ConnectSteam:
    //         // 按 任务/steam id 进行污染，防止同一个steam账号多次获得该任务奖励
    //         taint = `${quest.id},${AuthorizationType.Steam},${verifyResult.steam?.steam_id}`
    //         break;
    //     case QuestType.Whitelist:
    //     case QuestType.GamePreRegister:
    //         // 按 任务/用户 进行污染，防止同一个用户多次获得该任务奖励
    //         taint = `${quest.id},user,${userId}`
    //         break;
    //     default:
    //         throw new Error(`quest ${quest.id} taint not implemented`)
    // }
    const now = Date.now();
    // 构建任务完成记录与审计记录，增加用户的MB
    const achievement = new QuestAchievement({
        quest_id: quest.id,
        user_id: userId,
        created_time: now,
    });
    const audit = new UserMoonBeamAudit({
        user_id: userId,
        type: UserMoonBeamAuditType.Quests,
        moon_beam_delta: quest.reward.amount,
        reward_taint: taint,
        corr_id: quest.id,
        created_time: now,
    });
    await doTransaction(async (session) => {
        const opts = {session};
        await achievement.save(opts);
        await audit.save(opts);
        await User.updateOne({user_id: userId}, {$inc: {moon_beam: audit.moon_beam_delta}}, opts);
    })
}

// 申请范围动态奖励任务(需要对应任务支持动态奖励类型，如钱包资产、steam账号资产)
function claimRangeRewardQuest(userId: string, quest: IQuest) {

}