import {Document, Schema, models, model} from 'mongoose'
import connectToMongoDbDev from "@/lib/mongodb/client";
import { LotteryRewardType } from "@/lib/models/LotteryPool";

export type IUserLotteryRewardItem = {
    // 奖励id
    item_id: string,
    // 中奖id
    reward_id: string,
    // 奖励类型
    reward_type: LotteryRewardType,
    // 奖励名称
    reward_name: string, 
    // 图标链接
    icon_url: string, 
    // 奖励等级
    reward_level: number,
    // 奖励是否已领取
    claimed: boolean,
    // 奖励获取类型, 1.直接获取 2.分享twitter并验证后获取 3.分享twitter并验证后等待工作人员统一发放
    reward_claim_type: number, 
    // 奖励数量
    amount: number
}

export interface IUserLotteryDrawHistory extends Document {
    // 抽奖id
    draw_id: string;
    // 抽奖时间，毫秒时间戳
    draw_time: number;
    // 用户id
    user_id: string;
    // 奖池id
    lottery_pool_id: string;
    // 抽中奖品
    rewards: IUserLotteryRewardItem[];
    // 更新时间毫秒时间戳
    updated_time: number,
    // 删除时间毫秒时间戳
    deleted_time: number | null,
}

const UserLotteryDrawHistorySchema = new Schema<IUserLotteryDrawHistory>({
    draw_id: { type: String},
    draw_time: { type: Number },
    user_id: { type: String},
    lottery_pool_id: { type: String },
    rewards: { type: Schema.Types.Mixed },
    updated_time: { type: Number },
    deleted_time: { type: Number }
});

// 抽奖记录索引
UserLotteryDrawHistorySchema.index({ draw_id: 1 }, { unique: true });
UserLotteryDrawHistorySchema.index({ user_id: 1, lottery_pool_id: 1 });

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const UserLotteryDrawHistory = models.UserLotteryDrawHistory || connection.model<IUserLotteryDrawHistory>('UserLotteryDrawHistory', UserLotteryDrawHistorySchema, 'user_lottery_draw_history');
export default UserLotteryDrawHistory;

