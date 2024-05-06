import {Document, Schema, models, model} from 'mongoose'
import connectToMongoDbDev from "@/lib/mongodb/client";

export enum MintSourceType {
    // 徽章
    Badges = 'badges',
}

export enum MintStatus {
    // 已获得，但是未上链
    Qualified = 'qualified',
    // Mint中
    Minting = 'minting',
    // 已确认
    Confirmed = 'confirmed',
}

export interface IMint extends Document {
    // mint记录id，唯一标识，注意，需要确保该id必须为byte32的hash值
    id: string,
    // mint的链id
    chain_id: string,
    // mint起源类型
    source_type: MintSourceType,
    // mint类型对应的原始记录id，比如徽章id
    source_id: string,
    // 徽章等级，当source_type为badges时有效
    badge_level: string,
    // 用户id
    user_id: string,
    // mint状态
    status: MintStatus,
    // mint的接收者地址
    to_address: string,
    // 获取时间，毫秒时间戳
    obtained_time: number,
    // 交易hash
    transaction_hash: string,
    // 交易时间，毫秒时间戳
    transaction_time: number,
    // 链上交易确认时间，毫秒时间戳
    tx_confirmed_time: number,
    // mint污点，用于确保mint的唯一性，比如用户不能多次获取同一个徽章的同一个等级，同一个接收者地址不能多次获取同一个徽章
    taints: string[],
}

const MintSchema = new Schema<IMint>({
    id: {type: String},
    chain_id: {type: String},
    source_type: {type: String},
    source_id: {type: String},
    badge_level: {type: String},
    user_id: {type: String},
    status: {type: String},
    to_address: {type: String},
    obtained_time: {type: Number},
    transaction_time: {type: Number},
    transaction_hash: {type: String},
    tx_confirmed_time: {type: Number},
    taints: {type: [String]},
});

MintSchema.index({id: 1}, {unique: true});
MintSchema.index({taints: 1}, {unique: true});
MintSchema.index({source_type: 1, source_id: 1});
MintSchema.index({user_id: 1});

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const Mint = models.Mint || connection.model<IMint>('Mint', MintSchema, 'mints');
export default Mint;