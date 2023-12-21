import UserSteam from "@/lib/models/UserSteam";
import {IQuest} from "@/lib/models/Quest";
import {verifyQuestResult} from "@/lib/quests/types";

export async function queryUserSteamAuthorization(userId: string): Promise<any> {
    return await UserSteam.findOne({user_id: userId, deleted_time: null});
}

// 校验用户是否绑定了steam
export async function verifyConnectSteamQuest(userId: string, quest: IQuest): Promise<verifyQuestResult> {
    const steam = await queryUserSteamAuthorization(userId);
    return {claimable: !!steam, steam: steam};
}