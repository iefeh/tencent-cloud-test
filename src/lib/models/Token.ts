import {Document, Schema, models} from 'mongoose'
import connectToMongoDbDev from "@/lib/mongodb/client";

export interface IToken extends Document {
    // token id，全表唯一，
    token_id: string,
    // 目标链id
    chain_id: string,
    // 代币名称
    name: string,
    // 代币符号
    symbol: string,
    // 目标token地址
    address: string,
    // 原始代币小数位数
    decimal: number,
    // 代币图标
    icon: string
}

const TokenSchema = new Schema<IToken>({
    token_id: {type: String, required: true},
    chain_id: {type: String},
    name: {type: String},
    symbol: {type: String},
    address: {type: String},
    decimal: {type: Number, required: true},
    icon: {type: String, required: true}
});
// 唯一索引，同一个任务不允许多次完成
TokenSchema.index({token_id: 1}, {unique: true});

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const Token = models.Token || connection.model<IToken>('Token', TokenSchema, 'tokens');
export default Token;