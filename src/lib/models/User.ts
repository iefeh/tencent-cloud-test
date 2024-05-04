import {Document, Model, model, models, Schema} from 'mongoose';
import connectToMongoDbDev from "@/lib/mongodb/client";


export interface IUser extends Document {
    // 用户id，全局唯一标识
    user_id: string,
    // 用户昵称
    username: string,
    // 头像地址
    avatar_url: string,
    // 绑定的邮件
    email?: string,
    // MB数量
    moon_beam: number,
    // 通用抽奖券数量
    lottery_ticket_amount: number,
    // particle网络的属性
    particle?: {
        user_id: string,
        // web端的token
        web_token: string,
        ios_token: { type: String },
        android_token: { type: String },
        // 用户的托管钱包
        evm_wallet: string
    },
    // 用户邀请码
    invite_code: string;
    // 用户创建时间，毫秒时间戳
    created_time: number,
    // 申请账号自毁时间
    selfdestruct_request_time: number | null,
    // 用户删除时间
    deleted_time: number,
}

const UserSchema = new Schema<IUser>({
    user_id: {type: String, required: true, unique: true},
    username: {type: String},
    avatar_url: {type: String},
    email: {type: String},
    moon_beam: {type: Number, default: 0},
    lottery_ticket_amount: {type: Number, default: 0},
    particle: {
        user_id: {type: String},
        web_token: {type: String},
        ios_token: {type: String},
        android_token: {type: String},
        evm_wallet: {type: String}
    },
    invite_code: {type: String},
    created_time: {type: Number, required: true},
    selfdestruct_request_time: {type: Number},
    deleted_time: {type: Number, default: null},
});

// 用户邮件，同一个邮件不允许多次绑定
UserSchema.index({email: 1}, {unique: true, partialFilterExpression: {email: {$exists: true}}});
// 邀请码全局唯一
UserSchema.index({invite_code: 1}, {unique: true, partialFilterExpression: {email: {$exists: true}}});
// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const User = models.User || connection.model<IUser>('User', UserSchema, 'users');
export default User;

// 增加用户MB
export async function increaseUserMoonBeam(user_id: string, delta: number, session: any) {
    return await User.updateOne({user_id}, {$inc: {moon_beam: delta}}, {session});
}