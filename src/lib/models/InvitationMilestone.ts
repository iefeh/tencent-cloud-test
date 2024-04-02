import {Document, Schema, models, model} from 'mongoose'
import connectToMongoDbDev from "@/lib/mongodb/client";

export interface IInvitationMilestone extends Document {
    // 当前邀请里程
    milestone: number;
    // 最小邀请注册人数（注意必须获取了新手徽章才算完成注册）
    min_invitation: number;
    // 奖励的徽章
    reward_badge_id: string;
}

const InvitationMilestoneSchema = new Schema<IInvitationMilestone>({
    milestone: {type: Number},
    min_invitation: {type: Number},
    reward_badge_id: {type: String},
});


// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const InvitationMilestone = models.InvitationMilestone || connection.model<IInvitationMilestone>('InvitationMilestone', InvitationMilestoneSchema, 'invitation_milestones');
export default InvitationMilestone;