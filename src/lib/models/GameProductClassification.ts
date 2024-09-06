import {Document, Schema, models, model} from 'mongoose';
import { ProductLimitType } from '@/lib/models/GameProduct';
import connectToMongoDbDev from "@/lib/mongodb/client";

export type ProductTypeItem = {
    // 产品包id
    id: string;
    // 包体分类名称
    name: string;
    // 包体刷新周期
    limit_type: ProductLimitType; 
    // 显示顺序
    order: number;
}

const ProductTypeItemSchema = new Schema<ProductTypeItem>({
    id: { type: String, required: true },
    name: { type: String, required: true },
    limit_type: { type: String, required: true },
    order: { type: Number, required: true },
});

export interface IGameProductClassification extends Document {
    // 分类id
    id: string
    // 游戏id
    game_id: string;
    // 分类名称
    name: string;
    // 顺序
    order: number;
    // 是否活动
    active: boolean;
    // 产品包体
    product_types: ProductTypeItem[];
}

const GameProductClassificationSchema = new Schema<IGameProductClassification>({
    id: { type: String, required: true },
    game_id: { type: String, required: true },
    name: { type: String, required: true },
    order: { type: Number, required: true },
    active: { type: Boolean, required: true },
    product_types: [ProductTypeItemSchema],
});

GameProductClassificationSchema.index({ game_id: 1 });
GameProductClassificationSchema.index({ game_id: 1, order: 1 }, { unique: true });

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const GameProductClassification = models.GameProductClassification || connection.model<IGameProductClassification>('GameProductClassification', GameProductClassificationSchema, 'game_product_classifications');
export default GameProductClassification;