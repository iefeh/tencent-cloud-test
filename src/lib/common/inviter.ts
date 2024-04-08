import User from "../models/User";
import UserInvite from "../models/UserInvite";

export async function getInviterFromDirectInviteUser(userId: string): Promise<inviter | null> {
    // 检查用户的直接邀请人
    const directInviter = await UserInvite.findOne({ invitee_id: userId });
    if (!directInviter) {
        return null;
    }
    // 检查间接邀请人
    const indirectInviter = await UserInvite.findOne({ invitee_id: directInviter.user_id });
    return {
        direct: directInviter.user_id,
        indirect: indirectInviter ? indirectInviter.user_id : undefined,
    }
}

export async function getInviterFromDirectInviteCode(inviteCode: string): Promise<inviter | null> {
    // 检查用户的直接邀请人
    const directInviter = await User.findOne({ invite_code: inviteCode }, { _id: 0, user_id: 1 });
    if (!directInviter) {
        return null;
    }
    // 检查间接邀请人
    const indirectInviter = await UserInvite.findOne({ invitee_id: directInviter.user_id });
    return {
        direct: directInviter.user_id,
        indirect: indirectInviter ? indirectInviter.user_id : undefined,
    }
}

export type inviter = {
    // 直接邀请人
    direct: string;
    // 间接邀请人
    indirect: string;
}