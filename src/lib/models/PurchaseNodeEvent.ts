import {Document, Schema, models, PipelineStage} from 'mongoose'
import connectToMongoDbDev from "@/lib/mongodb/client";

export interface IPurchaseNodeEvent extends Document {
    // 目标链id
    chain_id: string,
    // 块数量
    block_number: number,
    // 交易hash
    transaction_hash: string,
    // 交易状态
    transaction_status: string,
    // 合约地址
    contract_address: string,
    // 购买钱包地址
    buyer_wallet_addr: string,
    // node tier id
    tier_id: string,
    // node数量
    amount: number,

    promo_code: string
    // 创建时间, 毫秒时间戳
    created_time: number,
    // 交易确认时间, 毫秒时间戳
    confirmed_time: number,
    // 删除时间, 毫秒时间戳
    deleted_time: number
}

const PurchaseNodeEventSchema = new Schema<IPurchaseNodeEvent>({
    chain_id: {type: String},
    block_number: {type: Number},
    transaction_hash: {type: String},
    transaction_status: {type: String},
    contract_address: {type: String},
    buyer_wallet_addr: {type: String},
    tier_id: {type: String},
    amount: {type: Number},
    promo_code: {type: String},
    created_time: {type: Number},
    confirmed_time: {type: Number},
    deleted_time: {type: Number},
});
// 唯一索引，同一个任务不允许多次完成
PurchaseNodeEventSchema.index({chain_id: 1, transaction_hash: 1}, {unique: true});
PurchaseNodeEventSchema.index({buyer_wallet_addr: 1});
PurchaseNodeEventSchema.index({promo_code: 1});

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const PurchaseNodeEvent = models.PurchaseNodeEvent || connection.model<IPurchaseNodeEvent>('PurchaseNodeEvent', PurchaseNodeEventSchema, 'purchase_node_events');
export default PurchaseNodeEvent;

export async function getUserNodePurchaseAmount(userWalletAddr: string) {
    let matchOpt: any = {
        $match: {
            buyer_wallet_addr: userWalletAddr,
            transaction_status: 'confirmed',
            deleted_time: null, 
        }
    };
    const aggregateQuery: PipelineStage[] = [
        matchOpt,
        {
            $project: {
                _id: 0,
                __v: 0,
            },
        },
        {
            $group: {
                _id: "$buyer_wallet_addr",
                amount: {$sum: "$amount"},
            }
        },
        {
            $project: { _id: 0, amount: 1 }
        }
    ];
    const results = await PurchaseNodeEvent.aggregate(aggregateQuery);
    if (!results || results.length === 0) {
      return null;
    }
    return results[0].amount;
}