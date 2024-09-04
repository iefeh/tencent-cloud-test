import {Document, Schema, models, model} from 'mongoose'
import connectToMongoDbDev from "@/lib/mongodb/client";

export enum ProductLimitType {
    Daily = "daily",
    Weekly = "weekly",
    Monthly = "monthly",
}

export interface IGameProduct extends Document {
    // 产品id
    id: string;
    // 产品名称
    name: string;
    // 游戏id
    game_id: string;
    // 图片链接
    icon_url: string;
    // usdc定价
    price_in_usdc: number;
    // 产品分类id, 对应GameProductClassification.product_types.id, 用来提供分类显示
    product_type_id: string;
    // 购买限制
    limit: {
        // 购买限制周期
        type: ProductLimitType;
        // 周期内限购数量
        amount: number;
    };
    // 产品是否上架
    active: boolean;
}

const GameProductSchema = new Schema<IGameProduct>({
    id: { type: String, required: true },
    name: { type: String, required: true },
    game_id: { type: String, required: true },
    icon_url: { type: String, required: true },
    price_in_usdc: { type: Number, required: true },
    product_type_id: { type: String, required: true },
    limit: { 
        type: { type: String },
        amount: { type: Number },
    },
    active: { type: Boolean, required: true },
});

// 客户唯一索引，同一个在对应客户只会存在一个有效的code
GameProductSchema.index({ id: 1 }, { unique: true });

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const GameProduct = models.GameProduct || connection.model<IGameProduct>('GameProduct', GameProductSchema, 'game_products');
export default GameProduct;