import {IQuest, QuestType} from "@/lib/models/Quest";
import {IUserMoonBeamAudit} from "@/lib/models/UserMoonBeamAudit";
import logger from "@/lib/logger/winstonLogger";

export type verifyQuestResult = {
    // 是否可以申请任务
    claimable: boolean;
    // 任务对应的audit记录
    audit: IUserMoonBeamAudit;
}

export async function verifyUserQuest(userId: string, quest: IQuest): Promise<IUserMoonBeamAudit> {
    switch (quest.type) {
        case QuestType.ConnectWallet:
            break;
        case QuestType.ConnectTwitter:
            break;
        case QuestType.ConnectDiscord:
            break;
        case QuestType.ConnectTelegram:
            break;
        case QuestType.ConnectSteam:
            break;
        case QuestType.FollowOnTwitter:
            break;
        case QuestType.RetweetTweet:
            break;
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
}