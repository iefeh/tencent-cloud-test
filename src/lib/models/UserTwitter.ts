import {Document, Schema, models, model} from 'mongoose'

export interface IUserTwitter extends Document {
    // 谷歌用户的关联id
    user_id: string,
    // 用户的推特id
    twitter_id: string,
    description: string,
    verified: boolean | false,
    // twitter唯一昵称
    username: string | null,
    name: string | null,
    url: string | null,
    // The URL of the user's profile picture
    protected: string | null,
    // The URL of the user's profile page
    profile_image_url: string | null,
    location: string,
    // 推特注册时间
    register_time: string,
    public_metrics: any,
    // 创建时间毫秒时间戳
    created_time: number,
    // 删除时间毫秒时间戳
    deleted_time: number | null,
}

const UserTwitterSchema = new Schema<IUserTwitter>({
    user_id: {type: String, required: true},
    twitter_id: {type: String, required: true},
    description: {type: String, default: null},
    verified: {type: Boolean, default: null},
    username: {type: String, default: null},
    name: {type: String, default: null},
    url: {type: String, default: null},
    protected: {type: Boolean, default: null},
    profile_image_url: {type: String},
    location: {type: String, default: null},
    register_time: {type: String},
    public_metrics: Schema.Types.Mixed,
    created_time: {type: Number, required: true},
    deleted_time: {type: Number, default: null},
});
// 用户唯一索引，同一个用户不允许绑定多个同类账号
UserTwitterSchema.index({user_id: 1, deleted_time: 1}, {unique: true});
// 谷歌唯一索引，同一个账号不允许多绑定
UserTwitterSchema.index({twitter_id: 1, deleted_time: 1}, {unique: true});

// 使用既有模型或者新建模型
export default models.UserTwitter || model<IUserTwitter>('UserTwitter', UserTwitterSchema, 'user_twitters');
