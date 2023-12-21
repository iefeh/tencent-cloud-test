import {Document, Schema, models, model} from 'mongoose'

export enum QuestType {
    ConnectWallet = "connect_wallet",
    ConnectTwitter = "connect_twitter",
    ConnectDiscord = "connect_discord",
    ConnectTelegram = "connect_telegram",
    ConnectSteam = "connect_steam",
    FollowOnTwitter = "follow_on_twitter",
    RetweetTweet = "retweet_tweet",
    HoldDiscordRole = "hold_discord_role",
    Whitelist = "whitelist",
    GamePreRegister = "game_pre_register",
    HoldNFT = "hold_nft",
}

export enum QuestRewardType {
    // 固定奖励，奖励数量配置于当前任务中
    Fixed = "fixed",
    // 范围奖励，奖励数量特定于任务进行动态分配
    Range = "range",
}

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
    // 任务属性，根据任务类型不同，属性不同
    properties: any,
    // 奖励设置
    reward: {
        // 奖励类型
        type: QuestRewardType,
        // 任务奖励数量，当奖励类型为range时表示最少可以获得的奖励
        amount: number,
        // 当任务奖励为range时，最大可以获得的奖励数量
        max_amount: number,
    },
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
    properties: Schema.Types.Mixed,
    reward: {
        type: {type: String},
        amount: {type: Number},
        max_amount: {type: Number},
    },
    created_time: {type: Number},
    updated_time: {type: Number},
    deleted_time: {type: Number},
});
// 任务唯一索引
QuestSchema.index({id: 1}, {unique: true});

// 使用既有模型或者新建模型
export default models.Quest || model<IQuest>('Quest', QuestSchema, 'quests');