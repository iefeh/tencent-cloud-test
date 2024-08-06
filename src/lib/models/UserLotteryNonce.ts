import {Document, Schema, models} from 'mongoose';
import connectToMongoDbDev from '@/lib/mongodb/client';
import UserMetrics from "@/lib/models/UserMetrics";

// 用户抽奖nonce值
export interface IUserLotteryNonce extends Document {
    // 用户id
    user_id: string;
    // 当前用户的nonce值
    nonce: number;
    // 创建时间毫秒时间戳
    created_time: number;
}

const UserLotteryNonceSchema = new Schema<IUserLotteryNonce>({
    user_id: {type: String},
    nonce: {type: Number, default: 1},
    created_time: {type: Number, required: true},
});

// 用户奖池记录
UserLotteryNonceSchema.index({user_id: 1}, {unique: true});

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const UserLotteryNonce = models.UserLotteryNonce || connection.model<IUserLotteryNonce>('UserLotteryNonce', UserLotteryNonceSchema, 'user_lottery_nonce');
export default UserLotteryNonce;


// 获取当前的nonce值，如果不存在则创建一个
export async function getUserNonce(userId: string): Promise<number> {
    const userNonce = await UserLotteryNonce.findOne({user_id: userId});
    if (userNonce) {
        return userNonce.nonce;
    }
    await UserLotteryNonce.updateOne(
        {user_id: userId},
        {
            $setOnInsert: {
                nonce: 1,
                created_time: Date.now(),
            }
        },
        {upsert: true}
    );
    return 1;
}

// 执行upsert，如果存在则nonce+1，否则创建一个并nonce设置为1
export async function incrementUserNonce(userId: string, session?: any): Promise<number> {
    const userNonce = await UserLotteryNonce.findOneAndUpdate(
        {user_id: userId},
        {
            $inc: {nonce: 1},
            $setOnInsert: {
                created_time: Date.now(),
            }
        },
        {upsert: true, new: true, session}
    );
    return userNonce.nonce;
}