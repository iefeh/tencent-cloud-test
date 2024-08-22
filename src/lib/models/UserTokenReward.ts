import {Document, Schema, models} from 'mongoose'
import connectToMongoDbDev from "@/lib/mongodb/client";

export enum UserTokenAuditStatus {
    Pending = "pending",
    Claiming = "claiming",
    Claimed = "claimed"
}

export enum UserTokenSourceType {
    Quest = "quest"
}

export interface IUserTokenReward extends Document {
    // 奖励id，全表唯一，
    // 如果奖励的前置条件已经进行了可重复过滤，则此处可以使用 ethers.id(`${user_id},${quest_id}`) 生成该值
    reward_id: string,
    user_id: string,
    source_type: UserTokenSourceType,
    source_id: string,
    // 代币id
    token_id: string,
    // 原始代币数量
    token_amount_raw: number,
    // 格式化以后的代币数量
    token_amount_formatted: string,
    // 交易hash
    tx_hash: string,
    // 记录状态 pending(待领取)、claiming(领取中)、claimed(已领取)
    status: UserTokenAuditStatus,
    // 创建时间毫秒时间戳
    created_time: number,
    // 开始领取时间，毫秒时间戳
    start_claim_time: number,
    // 领取成功时间，毫秒时间戳
    claimed_time: number
}

const UserTokenRewardSchema = new Schema<IUserTokenReward>({
    reward_id: {type: String, required: true},
    user_id: {type: String, required: true},
    source_type: {type: String, required: true},
    source_id: {type: String},
    token_id: {type: String},
    token_amount_raw: {type: Number},
    token_amount_formatted: {type: String},
    tx_hash: {type: String},
    status: {type: String},
    created_time: {type: Number, required: true},
    start_claim_time: {type: Number, default: null},
    claimed_time: {type: Number}
});
// 唯一索引，同一个任务不允许多次完成
UserTokenRewardSchema.index({reward_id: 1}, {unique: true});

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const UserTokenReward = models.UserTokenReward || connection.model<IUserTokenReward>('UserTokenReward', UserTokenRewardSchema, 'user_token_reward');
export default UserTokenReward;