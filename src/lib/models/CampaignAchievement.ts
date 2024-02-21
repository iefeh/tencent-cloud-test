import {Document, Schema, models, model} from 'mongoose'
import connectToMongoDbDev from "@/lib/mongodb/client";

// 活动完成记录
export interface ICampaignAchievement extends Document {
    // 用户达成的活动id
    campaign_id: string,
    // 达成活动的用户id
    user_id: string,
    // 创建时间毫秒时间戳
    created_time: number,
    // 奖励领取时间，毫秒时间戳
    claimed_time: number,
}

const CampaignAchievementSchema = new Schema<ICampaignAchievement>({
    campaign_id: {type: String, required: true},
    user_id: {type: String, required: true},
    created_time: {type: Number},
    claimed_time: {type: Number},
});

CampaignAchievementSchema.index({user_id: 1, campaign_id: 1}, {unique: true});
CampaignAchievementSchema.index({campaign_id: 1, user_id: 1});

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const CampaignAchievement = models.CampaignAchievement || connection.model<ICampaignAchievement>('CampaignAchievement', CampaignAchievementSchema, 'campaign_achievements');
export default CampaignAchievement;
