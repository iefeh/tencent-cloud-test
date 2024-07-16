import { Document, Schema, models, model } from 'mongoose'
import connectToMongoDbDev, { connectToMongoDbDiscord } from "@/lib/mongodb/client";


export enum CampaignRewardType {
    // 奖励MB
    MoonBeam = 'moon_beam',
    // 奖励徽章
    Badge = 'badge',
    // 抽奖机会
    LuckyDraw = 'lucky_draw',
    //任务数
    Task = 'task',
    //通过发送通知
    CDK = 'cdk',
}

// 活动奖励
type CampaignReward = {
    type: CampaignRewardType,
    // 奖励名称
    name: string,
    // 奖励图片(小)
    image_small: string,
    // 奖励图片(中)
    image_medium: string,
    // 奖励数量
    amount: number,
    //徽章ID
    badge_id: string,
    //任务权重
    season_pass_progress: number,
    //包含CDK的全局通知ID
    cdk_notification_id: string,
}

export enum CampaignStatus {
    // 活动未开始
    Upcoming = 'upcoming',
    // 活动进行中
    Ongoing = 'ongoing',
    // 活动已结束
    Ended = 'ended',
}

// 活动领取奖励的设置
export type CampaignClaimSettings = {
    // 领取奖励需要的授权，运营可以在任务中配置要求对应的授权，但是此处进行冗余设置，以确保用户领取奖励时的账号存在对应授权
    require_authorization: string,
    // 领取奖励后的提示
    success_message: string,
    // 奖励加速器的id集，奖励加速器见 src/lib/models/RewardAccelerator.ts 中的 IRewardAccelerator
    reward_accelerators: string[],
}

// 活动
export interface ICampaign extends Document {
    // 活动id
    id: string,
    // 活动名称
    name: string,
    // 活动描述
    description: string,
    // 活动图片地址
    image_url: string,
    // 活动是否激活
    active: boolean,
    // 活动开始时间，毫秒时间戳
    start_time: number,
    // 活动结束时间，毫秒时间戳
    end_time: number,
    // 活动的任务，
    // 任务结构采见 src/lib/models/Quest.ts 中的 IQuest
    // 任务的实现见 src/lib/quests
    tasks: any[],
    // 活动的奖励
    rewards: CampaignReward[],
    // 领取奖励的设置
    claim_settings: CampaignClaimSettings,
    // 创建时间毫秒时间戳
    created_time: number,
    // 更新时间毫秒时间戳
    updated_time: number,
    // 删除时间毫秒时间戳
    deleted_time: number | null,
}

const CampaignSchema = new Schema<ICampaign>({
    id: { type: String, required: true },
    name: { type: String },
    description: { type: String },
    image_url: { type: String },
    active: { type: Boolean },
    start_time: { type: Number },
    end_time: { type: Number },
    tasks: Schema.Types.Mixed,
    rewards: Schema.Types.Mixed,
    claim_settings: Schema.Types.Mixed,
    created_time: { type: Number },
    updated_time: { type: Number },
    deleted_time: { type: Number },
});

// 活动唯一id
CampaignSchema.index({ id: 1 }, { unique: true });

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const Campaign = models.Campaign || connection.model<ICampaign>('Campaign', CampaignSchema, 'campaigns');
export default Campaign;