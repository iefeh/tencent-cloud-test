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
    // 客户端id哈希
    client_id_hash: string,
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
    ranking: any;
    // 徽章及SBT数据
    badge: any[];
    // 社交媒体
    social: any[];
    // 买票的链id
    chain_id: string;
    // 买票的合约地址，如果是0地址表示使用原生代币
    token_address: string;
    // 票价
    ticket_price_raw: string;
    // 格式化的票价
    ticket_price_formatted: string;
}

const MiniGameDetailSchema = new Schema<IMiniGameDetail>({
    client_id: { type: String, required: true, unique: true },
    client_id_hash: { type: String },
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
    chain_id: { type: String },
    token_address: { type: String },
    ticket_price_raw: { type: String },
    ticket_price_formatted: { type: String },
});

// clientId全局唯一
MiniGameDetailSchema.index({ client_id: 1 }, { unique: true });

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const MiniGameDetail = models.MiniGameDetail || connection.model<IMiniGameDetail>('MiniGameDetail', MiniGameDetailSchema, 'mini_game_detail');
export default MiniGameDetail;