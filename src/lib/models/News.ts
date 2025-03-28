import { Document, Schema, models } from 'mongoose';
import { NewsType } from '@/constant/news';
import connectToMongoDbDev from "@/lib/mongodb/client";

// 文章记录
export interface INews extends Document {
    // 文章id，每个文章拥有唯一id
    id: string;
    // 文章类型
    type: NewsType;
    // 文章标签
    tags: string[];
    // 文章标题
    title: string;
    // 文章摘要
    summary: string;
    // 文章封面头图
    cover_url: string;
    // 文章内容
    content: string;
    // 是否发布
    is_published: boolean;
    // 点赞数
    like_count: number;
    // 转发数
    share_count: number;
    // 阅读数
    view_count: number;
    // 创建时间毫秒时间戳
    created_time: number;
    // 更新时间毫秒时间戳
    updated_time: number;
    // 定时发布时间毫秒时间戳
    scheduled_publish_time: number | null;
    // 发布时间毫秒时间戳
    published_time: number | null;
    // 删除时间
    deleted_time: number;
}

const NewsSchema = new Schema<INews>({
    id: { type: String, required: true },
    type: { type: String },
    tags: { type: [String], default: [], index: true },
    title: { type: String, required: true, index: true },
    summary: { type: String, required: true },
    cover_url: { type: String, default: null },
    content: { type: String, default: null },
    is_published: { type: Boolean, default: false },
    like_count: { type: Number, default: 0 },
    share_count: { type: Number, default: 0 },
    view_count: { type: Number, default: 0 },
    created_time: { type: Number },
    updated_time: { type: Number },
    scheduled_publish_time: { type: Number },
    published_time: { type: Number },
    deleted_time: { type: Number },
});

// 文章唯一索引
NewsSchema.index({ id: 1 }, { unique: true });

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const News = models.News || connection.model<INews>('News', NewsSchema, 'news');
export default News;
