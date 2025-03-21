import { Document, Schema, models } from 'mongoose';
import connectToMongoDbDev from "@/lib/mongodb/client";

// 资讯记录
export interface INewsMetrics extends Document {
    // 资讯id
    news_id: string;
    // 用户id
    user_id: string;
    // 是否点赞内容
    like_flag: boolean;
    // 是否转发内容
    share_flag: boolean;
}

const NewsMetricsSchema = new Schema<INewsMetrics>({
    news_id: { type: String, required: true },
    user_id: { type: String },
    like_flag: { type: Boolean, default: false },
    share_flag: { type: Boolean, default: false },
});

// 资讯度量唯一索引
NewsMetricsSchema.index({ news_id: 1, user_id: 1 }, { unique: true });
NewsMetricsSchema.index({ news_id: 1, user_id: 1, like_flag: 1 });
NewsMetricsSchema.index({ news_id: 1, user_id: 1, share_flag: 1 });

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const NewsMetrics = models.NewsMetricsAudit || connection.model<INewsMetrics>('NewsMetrics', NewsMetricsSchema, 'news_metrics');
export default NewsMetrics;
