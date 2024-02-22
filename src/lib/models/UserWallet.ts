import {Document, Schema, models, model} from 'mongoose'
import connectToMongoDbDev from "@/lib/mongodb/client";

// TODO：用户钱包需要添加资产同步标识？后台根据标识同步用户的资产，下发徽章？
export interface IUserWallet extends Document {
    // 用户id
    user_id: string,
    // 用户绑定的钱包地址
    wallet_addr: string,
    // 创建时间毫秒时间戳
    created_time: number,
    // 删除时间毫秒时间戳
    deleted_time: number | null,
}

const UserWalletSchema = new Schema<IUserWallet>({
    user_id: {type: String, required: true},
    wallet_addr: {type: String, required: true},
    created_time: {type: Number, required: true},
    deleted_time: {type: Number, default: null},
});

// 同一个用户不允许绑定多个钱包
UserWalletSchema.index({user_id: 1, deleted_time: 1}, {unique: true});
// 同一个钱包不允许多绑定
UserWalletSchema.index({wallet_addr: 1, deleted_time: 1}, {unique: true});

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const UserWallet = models.UserWallet || connection.model<IUserWallet>('UserWallet', UserWalletSchema, 'user_wallets');
export default UserWallet;