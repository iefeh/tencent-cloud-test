import {Document, Schema, models, model} from 'mongoose'
import connectToMongoDbDev from "@/lib/mongodb/client";

export interface IGameProductPurchase extends Document {
    // 用户id
    user_id: string;
    // 游戏id
    game_id: string;
    // 产品id
    product_id: string;
    // 购买时间, ISO时间戳, daily: 
    purchase_period: string;
}

const GameProductPurchaseSchema = new Schema<IGameProductPurchase>({
    user_id: { type: String, required: true },
    game_id: { type: String, required: true },
    product_id: { type: String, required: true },
    purchase_period: { type: String, required: true },
});

GameProductPurchaseSchema.index({ product_id: 1 });
GameProductPurchaseSchema.index({ user_id: 1, client_id: 1 });

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const GameProductPurchase = models.GameProductPurchase || connection.model<IGameProductPurchase>('GameProductPurchase', GameProductPurchaseSchema, 'game_product_purchases');
export default GameProductPurchase;