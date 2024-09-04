import {Document, Schema, models, model} from 'mongoose'
import connectToMongoDbDev from "@/lib/mongodb/client";

export interface IOAuth2ExchangeCode extends Document {
    user_id: string;
    client_id: string;
    authorization_code: string;
    expires_at: Date;
}

const OAuth2ExchangeCodeSchema = new Schema<IOAuth2ExchangeCode>({
    user_id: { type: String, required: true },
    client_id: { type: String, required: true },
    authorization_code: { type: String, required: true },
    expires_at: { type: Date, required: true },
});

// 客户唯一索引，同一个在对应客户只会存在一个有效的code
OAuth2ExchangeCodeSchema.index({ authorization_code: 1, expires_at: 1 }, { unique: true });
OAuth2ExchangeCodeSchema.index({ user_id: 1, client_id: 1}, { unique: true });
OAuth2ExchangeCodeSchema.index({ authorization_code: 1 });

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const OAuth2ExchangeCode = models.OAuth2ExchangeCode || connection.model<IOAuth2ExchangeCode>('OAuth2ExchangeCode', OAuth2ExchangeCodeSchema, 'oauth2_exchange_codes');
export default OAuth2ExchangeCode;