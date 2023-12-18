import {Document, Schema, models, model} from 'mongoose'

export type QuestType =
    "connect_wallet"
    | "connect_twitter"
    | "connect_discord"
    | "connect_telegram"
    | "connect_steam"
    | "follow_twitter"
    | "hold_nft";

export type QuestRewardType =
    "moon_beam"
    | "usdt";

// 任务记录
export interface IQuest extends Document {
    // 任务id，每个任务拥有唯一id
    id: string,
    // 任务名称
    name: string,
    // 任务描述
    description: string,
    // 任务提醒
    tip: string,
    // 任务类型
    type: QuestType,
    // 任务奖励类型
    reward_type: QuestRewardType,
    // 奖励数量
    reward_amount: number,
    // 创建时间毫秒时间戳
    created_time: number,
    // 更新时间毫秒时间戳
    updated_time: number,
    // 删除时间
    deleted_time: number,
}

const QuestSchema = new Schema<IQuest>({
    id: {type: String, required: true},
    name: {type: String},
    description: {type: String, default: null},
    tip: {type: String, default: null},
    type: {type: String},
    reward_type: {type: String, default: null},
    reward_amount: {type: String, default: null},
    created_time: {type: Number},
    updated_time: {type: Number},
    deleted_time: {type: Number},
});
// 任务唯一索引
QuestSchema.index({id: 1}, {unique: true});

// 使用既有模型或者新建模型
export default models.Quest || model<IQuest>('Quest', QuestSchema, 'quests');