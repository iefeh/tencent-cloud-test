import { Document, model, models, Schema } from 'mongoose';

import { LotteryRewardType } from '@/lib/lottery/types';
import connectToMongoDbDev from '@/lib/mongodb/client';

export enum LotteryPoolType {
    Public = 'public',
    Private = 'private'
}

export interface ILotteryRewardItem {
    // 奖励物品id
    item_id: string,
    // 奖励类型
    reward_type: LotteryRewardType,
    // 奖励名称
    reward_name: string, 
    // 奖励获取类型, 1.直接获取 2.分享twitter并验证后获取 3.分享twitter并验证后等待工作人员统一发放
    reward_claim_type: number, 
    // 奖励等级
    reward_level: number, 
    // 图标链接
    icon_url: string,
    // 保底中奖次数, 可以指定某几次抽奖会抽中保底
    guaranteed_draw_count: number[],
    // 抽中前需要抽奖次数
    min_reward_draw_amount: number,
    // 前三抽中奖概率
    first_three_draw_probability: number,
    // 4-10抽中奖概率
    next_six_draw_probability: number,
    // 奖励数量
    amount: number,
    // 徽章id，抽奖可能会奖励的徽章，这里只是为了展示用.
    badge_id?: string,
    // 奖励cdk
    cdk?: string,
    // 奖池中该库存个数, 不写则表示无限
    inventory_amount?: number | null
}

export type LotteryTwitterTopic = {
    reward_claim_type: number,
    twitter_topic_text: string,
    twitter_topic_hashtags: string[],
    twitter_topic_urls: string[]
}

export interface ILotteryPool extends Document {
    // 奖池id
    lottery_pool_id: string;
    // 奖池标题
    title: string;
    // 奖池名称(展示多奖池用)
    name: string;
    // 奖池开始时间，毫秒时间戳
    start_time: number;
    // 奖池结束时间，毫秒时间戳
    end_time: number;
    // 奖池图片信息
    icon_url: string;
    // 图标外框等级
    icon_frame_level: number,
    // 分享推文信息
    twitter_topics: LotteryTwitterTopic[];
    // 奖池分享tweet mb奖励数量
    twitter_verify_mb_reward_amount: number;
    // 每个用户可抽次数, 如果为null则无限次
    draw_limits: number | null;
    // 当前奖池总抽奖次数
    total_draw_amount: number;
    // 奖池抽奖奖励
    rewards: ILotteryRewardItem[];
    // 是否为活动奖池
    active: boolean;
    // 奖池类型
    type: LotteryPoolType;
    // 限量奖励数量, 无此属性或者小于0代表没有
    limited_qty: number;
    // 支持的链id
    chain_id: string;
    // 门槛说明
    requirement_description: string;
    // 创建时间毫秒时间戳
    created_time: number;
    // 更新时间毫秒时间戳
    updated_time: number;
    // 删除时间毫秒时间戳
    deleted_time: number | null;
}

const LotteryPoolSchema = new Schema<ILotteryPool>({
    lottery_pool_id: { type: String, required: true },
    title: { type: String, required: true },
    name: { type: String, required: true },
    start_time: { type: Number, required: true },
    end_time: { type: Number, required: true },
    icon_url: { type: String, required: true },
    icon_frame_level: { type: Number, required: true, default: 5 },
    twitter_topics: { type: Schema.Types.Mixed },
    twitter_verify_mb_reward_amount: { type: Number, default: 20 },
    draw_limits: { type: Number, default: 10 },
    total_draw_amount: { type: Number, required: true, default: 0 },
    rewards: { type: Schema.Types.Mixed, required: true },
    active: { type: Boolean, required: true },
    type: { type: String, required: true },
    limited_qty: { type: Number, required: true },
    chain_id: { type: String},
    requirement_description: { type: String },
    created_time: { type: Number },
    updated_time: { type: Number },
    deleted_time: { type: Number, default: null }
});

// 抽奖记录索引
LotteryPoolSchema.index({ lottery_pool_id: 1 }, { unique: true });

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const LotteryPool = models.LotteryPool || connection.model<ILotteryPool>('LotteryPool', LotteryPoolSchema, 'lottery_pool');
export default LotteryPool;

