import {Document, Schema, models, model} from 'mongoose'
import connectToMongoDbDev from "@/lib/mongodb/client";
import { Metric } from './UserMetrics';

// 徽章倒排索引
export interface IBadgeIndexEntry extends Document {
    // 指标
    metric: Metric,
    // 指标关联的徽章列表
    badge_ids: string[],
}

const BadgeIndexEntrySchema = new Schema<IBadgeIndexEntry>({
    metric: {type: String},
    badge_ids: {type: [String]},
});

BadgeIndexEntrySchema.index({metric: 1, badge_list: 1});

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const BadgeIndexEntry = models.BadgeIndexEntry || connection.model<IBadgeIndexEntry>('BadgeIndexEntry', BadgeIndexEntrySchema, 'badge_index_entries');
export default BadgeIndexEntry;