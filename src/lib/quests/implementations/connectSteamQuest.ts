import UserSteam from "@/lib/models/UserSteam";
import {IQuest} from "@/lib/models/Quest";
import {checkClaimableResult} from "@/lib/quests/types";

export async function queryUserSteamAuthorization(userId: string): Promise<any> {
    return await UserSteam.findOne({user_id: userId, deleted_time: null});
}

// 校验用户是否绑定了steam
export async function verifyConnectSteamQuest(userId: string, quest: IQuest): Promise<checkClaimableResult> {
    const steam = await queryUserSteamAuthorization(userId);
    return {claimable: !!steam};
}