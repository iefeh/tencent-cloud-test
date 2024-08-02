import {Document, Schema, models, model} from 'mongoose'
import connectToMongoDbDev from "@/lib/mongodb/client";

export interface IOAuth2Client extends Document {
    // 客户id
    client_id: string,
    // 客户端id哈希
    client_id_hash: string,
    // 客户名称
    client_name: string,
    // 客户secret
    client_secret: string,
    // 客户icon
    icon_url: string,
    // 客户重定向uri
    redirect_uris:  string[],
    // 客户授权类型
    grants: string[],
    // 授权的域
    scopes: string[],
    // 访问token有效期, 单位为秒
    access_token_lifetime: number,
}

const OAuth2ClientSchema = new Schema<IOAuth2Client>({
    client_id: { type: String, required: true },
    client_id_hash: { type: String },
    client_name: { type: String },
    client_secret: {type: String, required: true},
    icon_url: { type: String },
    redirect_uris: {type: [String]},
    grants: {type: [String]},
    scopes: {type: [String]},
    access_token_lifetime: {type: Number}
});
OAuth2ClientSchema.index({client_id: 1}, {unique: true});

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const OAuth2Client = models.OAuth2Client || connection.model<IOAuth2Client>('OAuth2Client', OAuth2ClientSchema, 'oauth2_clients');
export default OAuth2Client;