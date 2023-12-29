import {Document, Model, model, models, Schema} from 'mongoose';

export enum UserMoonBeamAuditType {
    Quests = "quests",
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
    // 关联的记录id
    corr_id: String;
    // 审计时间
    created_time: Number;
}

const UserMoonBeamAuditSchema = new Schema<IUserMoonBeamAudit>({
    user_id: {type: String, required: true},
    type: {type: String, required: true},
    moon_beam_delta: {type: Number, required: true},
    reward_taint: {type: String, default: null},
    corr_id: {type: String},
    created_time: {type: Number},
});

UserMoonBeamAuditSchema.index({uid: 1, type: 1});
UserMoonBeamAuditSchema.index({corr_id: 1});
UserMoonBeamAuditSchema.index({reward_taint: 1}, {unique: true});

const UserMoonBeamAudit = models.UserMoonBeamAudit || model<IUserMoonBeamAudit>("UserMoonBeamAudit", UserMoonBeamAuditSchema, 'user_moon_beam_audit');
export default UserMoonBeamAudit;