import { Document, Model, model, models, Schema } from 'mongoose';
import connectToMongoDbDev from "@/lib/mongodb/client";

export enum MiniGameStatus {
    InProgress = 'in_progress',
    ComingSoon = 'coming_soon',
    WaitForNextRound = 'wait_for_next_round'
}

// 可用小游戏
export enum MiniGames {
    Puffy2048 = 'puffy2048',
    Goldminer = 'goldminer'
}

export interface IMiniGame extends Document {
    // oauth2 client id
    client_id: string,
    // 游戏地址
    url: string,
    // 游戏图片
    img_url: string,
    // 游戏ICON
    icon_url?: string,
    // 简介
    description: string,
    // 门票相关配置
    ticket?: any,
    // 是否可用
    active: boolean,
    // 顺序
    order: number,
    // 开始时间
    start_time: number,
    // 结束时间
    end_time: number,
    // 用户创建时间，毫秒时间戳
    created_time: number,
    // 用户更改时间，毫秒时间戳
    updated_time: number
}

const MiniGameSchema = new Schema<IMiniGame>({
    client_id: { type: String, required: true, unique: true },
    url: { type: String },
    img_url: { type: String },
    icon_url: { type: String },
    description: { type: String },
    ticket: { type: Schema.Types.Mixed },
    active: { type: Boolean },
    order: { type: Number, required: true },
    start_time: { type: Number, required: true },
    end_time: { type: Number, required: true },
    created_time: { type: Number, required: true },
    updated_time: { type: Number, required: true }
});

// clientId全局唯一
MiniGameSchema.index({ client_id: 1 }, { unique: true });

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const MiniGame = models.MiniGame || connection.model<IMiniGame>('MiniGame', MiniGameSchema, 'mini_game');
export default MiniGame;