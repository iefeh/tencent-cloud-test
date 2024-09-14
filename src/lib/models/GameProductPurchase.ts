import {Document, Schema, models, model} from 'mongoose'
import connectToMongoDbDev from "@/lib/mongodb/client";

export interface IGameProductPurchase extends Document {
    // 请求id
    request_id: string;
    // 用户id
    user_id: string;
    // 游戏id
    game_id: string;
    // 产品id
    product_id: string;
    // 购买时间, ISO时间戳, daily: 
    purchase_period: string;
    // 通知时间, 毫秒时间戳，什么时候通知游戏侧并且对方响应http 200状态码.
    notify_time: number;
}

const GameProductPurchaseSchema = new Schema<IGameProductPurchase>({
    request_id: { type: String, required: true },
    user_id: { type: String, required: true },
    game_id: { type: String, required: true },
    product_id: { type: String, required: true },
    purchase_period: { type: String, required: true },
    notify_time: { type: Number },
});

GameProductPurchaseSchema.index({ product_id: 1 });
GameProductPurchaseSchema.index({ user_id: 1, client_id: 1 });

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const GameProductPurchase = models.GameProductPurchase || connection.model<IGameProductPurchase>('GameProductPurchase', GameProductPurchaseSchema, 'game_product_purchases');
export default GameProductPurchase;