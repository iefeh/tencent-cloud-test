import {Document, Schema, models, model} from 'mongoose'
import connectToMongoDbDev from "@/lib/mongodb/client";

export interface IGameProductToken extends Document {
    id: string;
    name: string;
    icon_url: string;
    symbol: string;
    decimal: number;
    token_address: string;
    chain_id: string;
    price_in_usdc: number;
    price_updated_at: number;
    product_discount: number;
}

const GameProductTokenSchema = new Schema<IGameProductToken>({
    id: { type: String, required: true },
    name: { type: String, required: true },
    icon_url: { type: String, required: true },
    symbol: { type: String, required: true },
    decimal: { type: Number, required: true },
    token_address: { type: String, required: true },
    chain_id: { type: String, required: true },
    price_in_usdc: { type: Number, required: true },
    price_updated_at: { type: Number },
    product_discount: { type: Number },
});

GameProductTokenSchema.index({ id: 1 }, { unique: true });

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const GameProductToken = models.GameProductToken || connection.model<IGameProductToken>('GameProductToken', GameProductTokenSchema, 'game_product_tokens');
export default GameProductToken;