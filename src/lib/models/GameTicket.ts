import { Document, Model, model, models, Schema } from 'mongoose';
import connectToMongoDbDev from "@/lib/mongodb/client";

export interface IGameTicket extends Document {
    pass_id: string,
    user_id: string,
    game_id: string,
    paid_token_id: string,
    paid_amount: number,
    consumed_time: number,
    created_at: number,
    expired_at: number,
}

const GameTicketSchema = new Schema<IGameTicket>({
    pass_id: { type: String, unique: true, required: true },
    user_id: { type: String, required: true },
    game_id: { type: String, required: true },
    paid_token_id: { type: String },
    paid_amount: { type: Number },
    consumed_time: { type: Number, default: null },
    created_at: { type: Number, required: true },
    expired_at: { type: Number, required: true },
});


GameTicketSchema.index({ pass_id: 1 }, { unique: true });
GameTicketSchema.index({ user_id: 1, game_id: 1 });

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const GameTicket = models.GameTicket || connection.model<IGameTicket>('GameTicket', GameTicketSchema, 'game_tickets');
GameTicket.createIndexes();
export default GameTicket;