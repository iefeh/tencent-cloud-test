import {Document, Schema, models, model} from 'mongoose'

export interface IUserGoogle extends Document {
    // 谷歌用户的关联id
    user_id: string,
    // 用户的谷歌id
    google_id: string,
    // 用户的谷歌email
    email: string,
    // 邮件是否校验
    email_verified: boolean;
    // 名
    given_name: string | '',
    // 姓
    family_name: string | '',
    // 用户的完全名字
    name: string | '',
    // The user's locale, represented by a [BCP 47](https://www.rfc-editor.org/info/bcp47) language tag
    locale: string | null,
    // The URL of the user's profile picture
    picture: string | null,
    // The URL of the user's profile page
    profile: string | null,
    // 创建时间毫秒时间戳
    created_time: number,
    // 删除时间毫秒时间戳
    deleted_time: number | null,
}

const UserGoogleSchema = new Schema<IUserGoogle>({
    user_id: {type: String, required: true},
    google_id: {type: String, required: true},
    email: {type: String},
    email_verified: {type: Boolean},
    given_name: {type: String},
    family_name: {type: String},
    name: {type: String},
    locale: {type: String},
    picture: {type: String},
    profile: {type: String},
    created_time: {type: Number, required: true},
    deleted_time: {type: Number, default: null},
});
// 用户唯一索引，同一个用户不允许绑定多个谷歌账号
UserGoogleSchema.index({user_id: 1, deleted_time: 1}, {unique: true});
// 谷歌唯一索引，同一个谷歌账号不允许多绑定
UserGoogleSchema.index({google_id: 1, deleted_time: 1}, {unique: true});

// 使用既有模型或者新建模型
const UserGoogle = models.UserGoogle || model<IUserGoogle>('UserGoogle', UserGoogleSchema, 'user_googles');
export default UserGoogle;
