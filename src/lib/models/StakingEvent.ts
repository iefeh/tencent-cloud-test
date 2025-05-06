import {Document, Schema, models, model} from 'mongoose'
import connectToMongoDbDev from "@/lib/mongodb/client";

export interface IStakingEvent extends Document {
    // 交易hash
    tx_hash: string,
    // 交易类型
    type: string,
    // 用户的钱包地址
    user: string,
    // 交易数量, 18位小数
    amount: string;
    // 奖励数量, 18位小数
    reward_amount: string,
    // 交易发起时间毫秒时间戳
    tx_time: number,
    // 交易确认时间毫秒时间戳
    confirmed_time: number | null,
}

const StakingEventSchema = new Schema<IStakingEvent>({
    tx_hash: {type: String, required: true},
    type: {type: String, required: true},
    user: {type: String},
    amount: {type: String},
    reward_amount: {type: String},
    tx_time: {type: Number, required: true},
    confirmed_time: {type: Number, default: null},
});
StakingEventSchema.index({tx_hash: 1}, {unique: true});

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const StakingEvent = models.UserGoogle || connection.model<IStakingEvent>('StakingEvent', StakingEventSchema, 'staking_events');
export default StakingEvent;
