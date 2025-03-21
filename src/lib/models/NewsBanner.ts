import { Document, Schema, models } from 'mongoose';
import connectToMongoDbDev from "@/lib/mongodb/client";

// banner记录
export interface INewsBanner extends Document {
    // banner id，每个banner拥有唯一id
    id: string;
    // 对应文章id
    news_id: string;
    // banner封面头图
    cover_url: string;
    // 显示顺序
    order: number;
    // 是否发布
    is_published: boolean;
    // 创建时间毫秒时间戳
    created_time: number;
    // 更新时间毫秒时间戳
    updated_time: number;
    // 发布时间毫秒时间戳
    published_time: number | null;
    // 删除时间
    deleted_time: number;
}

const NewsSchema = new Schema<INewsBanner>({
    id: { type: String, required: true },
    news_id: { type: String, required: true },
    cover_url: { type: String, default: null },
    order: { type: Number, default: 0 },
    is_published: { type: Boolean, default: false },
    created_time: { type: Number },
    updated_time: { type: Number },
    published_time: { type: Number },
    deleted_time: { type: Number },
});

// 资讯唯一索引
NewsSchema.index({ id: 1 }, { unique: true });

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const NewsBanner = models.News || connection.model<INewsBanner>('NewsBanner', NewsSchema, 'news_banners');
export default NewsBanner;
