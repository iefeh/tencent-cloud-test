import {Document, Schema, models, model} from 'mongoose'
import connectToMongoDbDev from "@/lib/mongodb/client";

export interface IGameProductToken extends Document {
    // 代币id
    id: string;
    // 代币名称
    name: string;
    // 图片链接
    icon_url: string;
    // 代币单位
    symbol: string;
    // 代币小数位数
    decimal: number;
    // 代币地址, 0代表源生代币
    token_address: string;
    // 链id
    chain_id: string;
    // usdc定价
    price_in_usdc: number;
    // 最近一次usdc价格更新时间
    price_updated_at: number;
    // 产品卖价折扣
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