import {Document, Schema, models} from 'mongoose';
import connectToMongoDbDev from '@/lib/mongodb/client';
import UserMetrics from "@/lib/models/UserMetrics";

// 用户抽奖请求
export interface IUserLotteryRequest extends Document {
    // 用户id
    user_id: string;
    // 当前用户的请求id值
    request_id: string;
    // 链id
    chain_id: string;
    // 奖池id
    lottery_pool_id: string;
    // 抽奖数量
    draw_count:number;
    // 抽奖券数量
    lottery_ticket_cost:number;
    // MB消耗数量
    mb_cost: number;
    // 创建时间毫秒时间戳
    created_time: number;
    // 对应的交易哈希
    tx_hash: string;
}

const UserLotteryRequestSchema = new Schema<IUserLotteryRequest>({
    user_id: {type: String},
    request_id: {type: String},
    chain_id: {type: String},
    lottery_pool_id: {type: String},
    draw_count: {type: Number},
    lottery_ticket_cost: {type: Number},
    mb_cost: {type: Number},
    created_time: {type: Number},
    tx_hash: {type: String},
});

UserLotteryRequestSchema.index({user_id: 1});
UserLotteryRequestSchema.index({requestId: 1}, {unique: true});

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const UserLotteryRequest = models.UserLotteryRequest || connection.model<IUserLotteryRequest>('UserLotteryRequest', UserLotteryRequestSchema, 'user_lottery_requests');
export default UserLotteryRequest;