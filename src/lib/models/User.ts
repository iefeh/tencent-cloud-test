import {Document, Model, model, models, Schema} from 'mongoose';


export interface IUser extends Document {
    // 用户id，全局唯一标识
    user_id: string,
    // 用户昵称
    username: string,
    // 头像地址
    avatar_url: string,
    // 绑定的邮件
    email?: string,
    // particle网络的属性
    particle?: {
        user_id: string,
        // web端的token
        web_token: string,
        // 用户的托管钱包
        evm_wallet: string
    }
    // 用户创建时间，毫秒时间戳
    created_time: number
}

const UserSchema = new Schema<IUser>({
    user_id: {type: String, required: true, unique: true},
    username: {type: String},
    avatar_url: {type: String},
    email: {type: String},
    particle: {
        user_id: {type: String},
        web_token: {type: String},
        evm_wallet: {type: String}
    },
    created_time: {type: Number, required: true},
});

// 用户邮件，同一个邮件不允许多次绑定
UserSchema.index({email: 1}, {unique: true, partialFilterExpression: {email: {$exists: true}}});

// 使用既有模型或者新建模型
export default models.User || model<IUser>('User', UserSchema, 'users');
