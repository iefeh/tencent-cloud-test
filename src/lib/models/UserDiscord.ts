import {Document, Schema, models, model} from 'mongoose'

export interface IUserDiscord extends Document {
    // 谷歌用户的关联id
    user_id: string,
    // 用户的dc id
    discord_id: string,
    username: string,
    // 头像，可能为null
    avatar: string;
    avatar_decoration: string,
    public_flags: number,
    premium_type: number,
    flags: number,
    banner: string,
    global_name: string,
    locale: string | null,
    email: string,
    verified: boolean;
    mfa_enabled: boolean,
    // 创建时间毫秒时间戳
    created_time: number,
    // 删除时间毫秒时间戳
    deleted_time: number | null,
}

const UserDiscordSchema = new Schema<IUserDiscord>({
    user_id: {type: String, required: true},
    discord_id: {type: String, required: true},
    username: {type: String},
    global_name: {type: String},
    avatar: {type: String},
    avatar_decoration: {type: String},
    public_flags: {type: Number},
    premium_type: {type: Number},
    flags: {type: Number},
    banner: {type: String},
    locale: {type: String},
    email: {type: String},
    verified: {type: Boolean},
    mfa_enabled: {type: Boolean},
    created_time: {type: Number, required: true},
    deleted_time: {type: Number, default: null},
});
// 用户唯一索引，同一个用户不允许绑定多个DC账号
UserDiscordSchema.index({user_id: 1, deleted_time: 1}, {unique: true});
// DC唯一索引，同一个DC账号不允许多绑定
UserDiscordSchema.index({discord_id: 1, deleted_time: 1}, {unique: true});

// 使用既有模型或者新建模型
const UserDiscord = models.UserDiscord || model<IUserDiscord>('UserDiscord', UserDiscordSchema, 'user_discords');
export default UserDiscord;
