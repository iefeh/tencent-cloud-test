import User from '../models/User';
import UserInvite from '../models/UserInvite';

export async function getInviteRelationshipFromDirectInviteUser(userId: string): Promise<inviteRelationship | null> {
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
    virtual: directInviter.virtual,
  };
}

export async function getInviteRelationshipFromDirectInviteCode(
  inviteCode: string,
): Promise<inviteRelationship | null> {
  // 检查用户的直接邀请人
  const directInviter = await User.findOne({ invite_code: inviteCode }, { _id: 0, user_id: 1, virtual: 1 });
  if (!directInviter) {
    return null;
  }

  // 检查间接邀请人
  const indirectInviter = await UserInvite.findOne({ invitee_id: directInviter.user_id });
  return {
    direct: directInviter.user_id,
    indirect: indirectInviter ? indirectInviter.user_id : undefined,
    virtual: directInviter.virtual,
  };
}

export type inviteRelationship = {
  // 直接邀请人
  direct: string;
  // 间接邀请人
  indirect: string;
  // 是虚拟邀请人
  virtual?: boolean;
};
