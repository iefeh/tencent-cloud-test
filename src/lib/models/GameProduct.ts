import {Document, Schema, models, model} from 'mongoose'
import connectToMongoDbDev from "@/lib/mongodb/client";

export enum ProductLimitType {
    Daily = "daily",
    Weekly = "weekly",
    Monthly = "monthly",
}

export interface IGameProduct extends Document {
    id: string;
    client_id: string;
    icon_url: string;
    price_in_usdc: number;
    limit: {
        type: ProductLimitType;
        amount: number;
    };
    active: boolean;
}

const GameProductSchema = new Schema<IGameProduct>({
    id: { type: String, required: true },
    client_id: { type: String, required: true },
    icon_url: { type: String, required: true },
    price_in_usdc: { type: Number, required: true },
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