import {Document, models, Schema} from 'mongoose';
import connectToMongoDbDev from "@/lib/mongodb/client";
import { increaseUserMoonBeam } from './User';
import UserInvite from './UserInvite';

export enum UserMoonBeamAuditType {
    // 任务
    Quests = "quests",
    // 活动
    Campaigns = "campaigns",
    // 活动额外奖励，由于活动可以挂载多个加速器，campaign_bonus对应着每个加速器给与的奖励
    CampaignBonus = "campaign_bonus",
    // 徽章
    Badges = "badges",
    // 被邀请用户注册
    InviteeRegistration = "invitee_registration",
    // 直接推荐人奖励，当被邀请用户得到新手徽章时视为完成注册，会给邀请者奖励
    DirectReferral = "direct_referral",
    // 间接推荐人奖励，当被邀请用户得到新手徽章时视为完成注册，会给间接邀请者奖励
    IndirectReferral = "indirect_referral",
}

// 用户MB的审计记录, 用户的个人MB=sum(moon_beam_delta)
export interface IUserMoonBeamAudit extends Document {
    // 关联的用户id
    user_id: String;
    // MB审计类型
    type: UserMoonBeamAuditType;
    // MB的变化值，可增，可减少.
    moon_beam_delta: Number;
    // MB奖励的污点，确保对应类型的奖励不会重复生成，如邀请任务中对单个用户进行反复邀请
    reward_taint: String;
    // 关联的记录id，
    // 如type=quests时是任务id
    // 如type=campaigns时是活动id
    // 如type=campaign_bonus时是活动id
    // 如type=badges时是徽章id
    corr_id: String;
    // 额外信息，
    // 如 type=quests && quest_type=connect_wallet时，存放用户的钱包资产(WalletAsset)id
    // 如 type=quests && quest_type=connect_steam时，存放用户的游戏资产(SteamUserGame)id
    // 如 type=campaign_bonus 时，存放加速器(IRewardAccelerator)id
    // 如 type=badges 时，存放徽章的等级
    extra_info: string;
    // 审计时间
    created_time: Number;
    // 删除时间，比如重新验证钱包时，会把该用户之前领取的奖励删除
    deleted_time: Number;
}

const UserMoonBeamAuditSchema = new Schema<IUserMoonBeamAudit>({
    user_id: {type: String, required: true},
    type: {type: String, required: true},
    moon_beam_delta: {type: Number, required: true},
    reward_taint: {type: String, default: null},
    corr_id: {type: String},
    extra_info: {type: String},
    created_time: {type: Number},
    deleted_time: {type: Number},
});

UserMoonBeamAuditSchema.index({user_id: 1, type: 1});
UserMoonBeamAuditSchema.index({corr_id: 1, user_id: 1});
UserMoonBeamAuditSchema.index({reward_taint: 1, deleted_time: 1}, {unique: true});

const connection = connectToMongoDbDev();
const UserMoonBeamAudit = models.UserMoonBeamAudit || connection.model<IUserMoonBeamAudit>("UserMoonBeamAudit", UserMoonBeamAuditSchema, 'user_moon_beam_audit');
export default UserMoonBeamAudit;

// 新用户被邀请注册的MB加成
export const NEW_INVITEE_REGISTRATION_MOON_BEAM_DELTA = 15;
// 被邀请者完成新手徽章的MB加成
export const DIRECT_REFERRAL_MOON_BEAM_DELTA = 30;
// 间接推荐人的MB加成
export const INDIRECT_REFERRAL_MOON_BEAM_DELTA = 5;

// 保存新用户被邀请注册的审计记录
export async function saveNewInviteeRegistrationMoonBeamAudit(inviteeId: string, inviterId: any, session: any) {
    if (!inviterId) {
        return;
    }
    const audit = new UserMoonBeamAudit({
        user_id: inviteeId,
        type: UserMoonBeamAuditType.InviteeRegistration,
        moon_beam_delta: NEW_INVITEE_REGISTRATION_MOON_BEAM_DELTA,
        reward_taint: `invitee_${inviteeId}`,
        corr_id: inviterId,
        created_time: Date.now(),
    });
    return await audit.save({session});
}

export async function saveInviterMoonBeamReward(inviteeId: string, inviterId: string, indirectInviterId: string, session: any) {
    if (!inviterId) {
        return;
    }
    // 保存直接邀请者的MB审计记录与奖励
    const inviterAudit = new UserMoonBeamAudit({
        user_id: inviterId,
        type: UserMoonBeamAuditType.DirectReferral,
        moon_beam_delta: DIRECT_REFERRAL_MOON_BEAM_DELTA,
        reward_taint: `direct_referral:${inviteeId}`,
        corr_id: inviteeId,
        created_time: Date.now(),
    });
    await inviterAudit.save({session});
    await increaseUserMoonBeam(inviterId, DIRECT_REFERRAL_MOON_BEAM_DELTA, session);

    // 保存间接邀请者的MB审计记录与奖励
    if (!indirectInviterId) {
        return;
    }
    const indirectInviterAudit = new UserMoonBeamAudit({
        user_id: indirectInviterId,
        type: UserMoonBeamAuditType.IndirectReferral,
        moon_beam_delta: INDIRECT_REFERRAL_MOON_BEAM_DELTA,
        reward_taint: `direct_referral:${inviterId},indirect_referral:${inviteeId}`,
        corr_id: inviteeId,
        created_time: Date.now(),
    });
    await indirectInviterAudit.save({session});
    await increaseUserMoonBeam(indirectInviterId, INDIRECT_REFERRAL_MOON_BEAM_DELTA, session);
}