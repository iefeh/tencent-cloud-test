import {Document, Schema, models, model} from 'mongoose'
import connectToMongoDbDev from "@/lib/mongodb/client";

// 合并状态
export enum MergeStatus {
    // 请求合并中，此时合并请求已经发送到链上，但是还没有被确认
    Requesting = "requesting",
    // 请求合并已经链上确认，但是还没有被处理
    Requested = "requested",
    // 请求合并已经被回滚
    Rollback = "rollback",
    // 尝试发送请求合并交易，但是失败
    Reverted = "reverted",
    // 合并中，此时已发送合并交易到链上，等待合并交易确认
    Merging = "merging",
    // 合并完成，此时合并交易已经被链上确认
    Merged = "merged"
}

// 合并请求
export interface IMerge extends Document {
    request_chain_id: string;
    request_contract_address: string;
    request_block_number: number;
    request_transaction_id: string;
    request_wallet_addr: string;
    request_tokens: number[];
    request_confirmed_time: number;
    target_chain_id: string;
    target_contract_address: string;
    target_transaction_id: string;
    target_token_id: number;
    status: MergeStatus;
    created_time: number;
    start_merge_time: number;
    confirmed_time: number;
    deleted_time:  number | null;
}

const MergeSchema = new Schema<IMerge>({
    request_chain_id: {type: String},
    request_contract_address: {type: String},
    request_block_number: {type: Number},
    request_transaction_id: {type: String},
    request_wallet_addr: {type: String},
    request_tokens: {type: [Number]},
    request_confirmed_time: {type: Number},
    target_chain_id: {type: String},
    target_contract_address: {type: String},
    target_transaction_id: {type: String},
    target_token_id: {type: Number},
    status: {type: String, enum: Object.values(MergeStatus)},
    created_time: {type: Number},
    start_merge_time: {type: Number},
    confirmed_time: {type: Number},
    deleted_time: {type: Number, default: null},
});

MergeSchema.index({request_transaction_id: 1, deleted_time: 1}, {unique: true});
MergeSchema.index({request_wallet_addr: 1});
MergeSchema.index({target_transaction_id: 1});

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const Merge = models.Merge || connection.model<IMerge>('Merge', MergeSchema, 'merges');
export default Merge;