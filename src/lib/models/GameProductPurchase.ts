import {Document, Schema, models, model} from 'mongoose'
import connectToMongoDbDev from "@/lib/mongodb/client";

export interface IGameProductPurchase extends Document {
    user_id: string
    client_id: string;
    product_id: string;
    purchase_time: number;
}

const GameProductPurchaseSchema = new Schema<IGameProductPurchase>({
    user_id: { type: String, required: true },
    client_id: { type: String, required: true },
    product_id: { type: String, required: true },
    purchase_time: { type: Number, required: true },
});

GameProductPurchaseSchema.index({ product_id: 1 });
GameProductPurchaseSchema.index({ user_id: 1, client_id: 1 });

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const GameProductPurchase = models.GameProductPurchase || connection.model<IGameProductPurchase>('GameProductPurchase', GameProductPurchaseSchema, 'game_product_purchases');
export default GameProductPurchase;