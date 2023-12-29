import {Document, Schema, models, model} from 'mongoose'

export interface IOAuthToken extends Document {
    // token对应的平台
    platform: "twitter" | "discord",
    // 对应平台的用户id
    platform_id: string,
    // token类型
    token_type: string,
    // 访问token
    access_token: string,
    // 刷新token
    refresh_token: string,
    // 访问token的有效时间，单位秒
    expires_in: number,
    // 访问token的过期时间，毫秒时间戳
    expire_time: number,
    // 创建时间毫秒时间戳
    created_time: number,
    // 更新时间毫秒时间戳，通常发生在刷新token时
    updated_time: number,
    // token删除时间，通常在token使用无效后被删除.
    deleted_time: number,
}

const OAuthTokenSchema = new Schema<IOAuthToken>({
    platform: {type: String, required: true},
    platform_id: {type: String, required: true},
    token_type: {type: String, default: null},
    access_token: {type: String, default: null},
    refresh_token: {type: String, default: null},
    expires_in: {type: Number, default: null},
    expire_time: {type: Number, default: null},
    created_time: {type: Number, required: true},
    updated_time: {type: Number, required: true},
    deleted_time: {type: Number, default: null},
});
// 平台唯一索引，同一个在对应平台只会存在一个有效的token
OAuthTokenSchema.index({platform: 1, platform_id: 1, deleted_time: 1}, {unique: true});
OAuthTokenSchema.index({platform_id: 1});

// 使用既有模型或者新建模型
const OAuthToken = models.OAuthToken || model<IOAuthToken>('OAuthToken', OAuthTokenSchema, 'oauth_tokens');
export default OAuthToken;