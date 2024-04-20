import {Document, Schema, models, model} from 'mongoose'
import connectToMongoDbDev from "@/lib/mongodb/client";

export interface IOAuth2AuthorizationCode extends Document {
    authorization_code: string;
    expires_at: Date;
    redirect_uri: string[];
    scope: string[];
    client_id: string;
    user_id: string;
}

const OAuth2AuthorizationCodeSchema = new Schema<IOAuth2AuthorizationCode>({
    authorization_code: {type: String, required: true},
    expires_at: {type: Date, required: true},
    redirect_uri: {type: [String]},
    scope: {type: [String]},
    client_id: {type: String, required: true},
    user_id: {type: String, required: true}
});
// 客户唯一索引，同一个在对应客户只会存在一个有效的code
OAuth2AuthorizationCodeSchema.index({authorization_code: 1, expires_at: 1}, {unique: true});
OAuth2AuthorizationCodeSchema.index({authorization_code: 1});

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const OAuth2AuthorizationCode = models.OAuth2AuthorizationCode || connection.model<IOAuth2AuthorizationCode>('OAuth2AuthorizationCode', OAuth2AuthorizationCodeSchema, 'oauth2_authorization_codes');
export default OAuth2AuthorizationCode;