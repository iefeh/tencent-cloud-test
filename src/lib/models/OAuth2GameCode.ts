import {Document, Schema, models, model} from 'mongoose'
import connectToMongoDbDev from "@/lib/mongodb/client";

export interface IOAuth2GameCode extends Document {
    user_id: string;
    client_id: string;
    authorization_code: string;
    expires_at: Date;
}

const OAuth2GameCodeSchema = new Schema<IOAuth2GameCode>({
    user_id: { type: String, required: true },
    client_id: { type: String, required: true },
    authorization_code: { type: String, required: true },
    expires_at: { type: Date, required: true },
});

// 客户唯一索引，同一个在对应客户只会存在一个有效的code
OAuth2GameCodeSchema.index({ authorization_code: 1, expires_at: 1 }, { unique: true });
OAuth2GameCodeSchema.index({ user_id: 1, client_id: 1}, { unique: true });
OAuth2GameCodeSchema.index({ authorization_code: 1 });

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const OAuth2GameCode = models.OAuth2AuthorizationCode || connection.model<IOAuth2GameCode>('OAuth2GameCode', OAuth2GameCodeSchema, 'oauth2_game_codes');
export default OAuth2GameCode;