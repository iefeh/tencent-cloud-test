import { Document, model, models, Schema } from 'mongoose';
import connectToMongoDbDev from "@/lib/mongodb/client";

export enum Platform {
    IOS = 'ios',
    ANDROID = 'android',
    WIN = 'win'
}

export interface IMiniGameDetail extends Document {
    // oauth2 client id
    client_id: string,
    // 分享链接
    share: string,
    // 分享任务ID
    share_task?: string,
    // 海报相关
    poster?: any,
    // 游戏关键词
    keywords: string[],
    // 门票过期时间
    ticket_expired_at?: number,
    // 简介
    description: string,
    // banner
    banner: any[]
    // 支持的平台
    platform: any[],
    // 任务分类
    task_category: string,
    // 排名配置
    ranking: any
    // 徽章及SBT数据
    badge: any[]
    // 社交媒体
    social: any[]
}

const MiniGameDetailSchema = new Schema<IMiniGameDetail>({
    client_id: { type: String, required: true, unique: true },
    share: { type: String },
    share_task: { type: String },
    poster: { type: Schema.Types.Mixed },
    keywords: { type: [String] },
    ticket_expired_at: { type: Number },
    description: { type: String },
    banner: { type: Schema.Types.Mixed },
    platform: { type: Schema.Types.Mixed },
    task_category: { type: String },
    ranking: { type: Schema.Types.Mixed },
    badge: { type: Schema.Types.Mixed },
    social: { type: Schema.Types.Mixed },
});

// clientId全局唯一
MiniGameDetailSchema.index({ client_id: 1 }, { unique: true });

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const MiniGameDetail = models.MiniGameDetail || connection.model<IMiniGameDetail>('MiniGameDetail', MiniGameDetailSchema, 'mini_game_detail');
export default MiniGameDetail;