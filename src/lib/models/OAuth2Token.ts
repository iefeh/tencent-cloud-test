import {Document, Schema, models, model} from 'mongoose'
import connectToMongoDbDev from "@/lib/mongodb/client";

export interface IOAuth2Token extends Document {
    // 访问token
    access_token: string;
    // 访问token的过期时间
    access_token_expires_at: Date;
    // token使用范围
    scope: string[];
    // token对应client
    client_id: string;
    // token对应user
    user_id: string;
    // 创建时间，毫秒时间戳
    created_at: number;
}

const OAuth2TokenSchema = new Schema<IOAuth2Token>({
    access_token: { type: String},
    access_token_expires_at: { type: Date},
    scope: { type: [String] },
    client_id: { type: String},
    user_id: { type: String},
    created_at: { type: Number},
});

// 客户唯一索引，同一个在对应客户只会存在一个有效的token
OAuth2TokenSchema.index({ access_token: 1, access_token_expires_at: 1 }, { unique: true });

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const OAuth2Token = models.OAuth2Token || connection.model<IOAuth2Token>('OAuth2Token', OAuth2TokenSchema, 'oauth2_tokens');
export default OAuth2Token;

