import {Document, Model, model, models, Schema} from 'mongoose';
import connectToMongoDbDev from "@/lib/mongodb/client";

export enum UserMoonBeamAuditType {
    // 任务
    Quests = "quests",
    // 活动
    Campaigns = "campaigns",
    // 活动额外奖励，由于活动可以挂载多个加速器，campaign_bonus对应着每个加速器给与的奖励
    CampaignBonus = "campaign_bonus",
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
    corr_id: String;
    // 额外信息，
    // 如 type=quests && quest_type=connect_wallet时，存放用户的钱包资产(WalletAsset)id
    // 如 type=quests && quest_type=connect_steam时，存放用户的游戏资产(SteamUserGame)id
    // 如 type=campaign_bonus 时，存放加速器(IRewardAccelerator)id
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