import { Document, models, Schema } from 'mongoose';
import connectToMongoDbDev from "@/lib/mongodb/client";

export enum UserMoreAuditType {
    // 任务
    P2AQuest = "p2a_quest",
}

// 用户MB的审计记录, 用户的个人MB=sum(moon_beam_delta)
export interface IUserMoreAudit extends Document {
    // 关联的用户id
    user_id: String;
    // More审计类型
    source_type: UserMoreAuditType;
    // More的变化值，可增，可减少.
    more_delta: Number;
    // More奖励的污点，确保对应类型的奖励不会重复生成，如邀请任务中对单个用户进行反复邀请
    reward_taint: String;
    // More奖励的污点，确保在用户有多个校验方式的情况下不会重复领取奖励
    reward_taints: String[];
    // 关联的记录id，
    // 如type=quests时是任务id
    // 如type=campaigns时是活动id
    // 如type=campaign_bonus时是活动id
    // 如type=badges时是徽章id
    // 如type=lucky_draw时是抽奖奖品reward_id
    corr_id: String;
    // 额外信息，
    // 如 type=quests && quest_type=connect_wallet时，存放用户的钱包资产(WalletAsset)id
    // 如 type=quests && quest_type=connect_steam时，存放用户的游戏资产(SteamUserGame)id
    // 如 type=campaign_bonus 时，存放加速器(IRewardAccelerator)id
    // 如 type=badges 时，存放徽章的等级
    // 如 type=lucky_draw时是奖池id
    extra_info: string;
    // 审计时间
    created_time: Number;
    // 删除时间
    deleted_time: Number;
}

const UserMoonBeamAuditSchema = new Schema<IUserMoreAudit>({
    user_id: { type: String, required: true },
    source_type: { type: String, required: true },
    more_delta: { type: Number, required: true },
    reward_taint: { type: String, default: null },
    reward_taints: { type: [String] },
    corr_id: { type: String },
    extra_info: { type: String },
    created_time: { type: Number },
    deleted_time: { type: Number },
});

UserMoonBeamAuditSchema.index({ user_id: 1, type: 1 });
UserMoonBeamAuditSchema.index({ corr_id: 1, user_id: 1 });
UserMoonBeamAuditSchema.index({ reward_taint: 1, deleted_time: 1 }, { unique: true });

const connection = connectToMongoDbDev();
const UserMoreAudit = models.UserMoreAudit || connection.model<IUserMoreAudit>("UserMoreAudit", UserMoonBeamAuditSchema, 'user_more_audit');
export default UserMoreAudit;