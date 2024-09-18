import {Document, Schema, models, model} from 'mongoose'
import connectToMongoDbDev from "@/lib/mongodb/client";
import { PipelineStage } from 'mongoose';

export interface IGameProductPurchaseRequest extends Document {
    // 请求id
    request_id: string;
    // 用户id
    user_id: string;
    // 游戏id
    game_id: string;
    // 用户请求使用支付的代币id
    token_id: string;
    // 产品id
    product_id: string;
    // 产品价格，用于当时价格
    product_price_in_usd: string;
    // 请求时间，毫秒时间戳
    request_time: number;
    // 请求的周期
    request_period: string;
    // 请求过期时间，毫秒时间戳
    request_expire_time: number;
    // 支付代币地址
    payment_token_address: string;
    // 支付代币数量
    payment_token_amount: string;
    // 代币价格
    payment_token_price_in_usd: string;

    // 支付交易哈希，仅在交易确认后再添加以下数据.
    payment_tx_hash: string;
    // 支付钱包地址
    payment_address: string;
    // 支付确认时间，经过一定区块数的确认.
    payment_confirm_time: number;
}

const GameProductPurchaseRequestSchema = new Schema<IGameProductPurchaseRequest>({
    request_id: {type: String, required: true},
    user_id: {type: String, required: true},
    game_id: {type: String, required: true},
    token_id: {type: String, required: true},
    product_id: {type: String, required: true},
    request_time: {type: Number},
    request_period: {type: String},
    request_expire_time: {type: Number},
    payment_tx_hash: {type: String},
    payment_address: {type: String},
    payment_token_address: {type: String},
    payment_token_amount: {type: String},
    payment_confirm_time: {type: Number},
});

GameProductPurchaseRequestSchema.index({request_id: 1}, {unique: true});
GameProductPurchaseRequestSchema.index({product_id: 1});
GameProductPurchaseRequestSchema.index({user_id: 1, game_id: 1});

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const GameProductPurchaseRequest = models.GameProductPurchaseRequest || connection.model<IGameProductPurchaseRequest>('GameProductPurchaseRequest', GameProductPurchaseRequestSchema, 'game_product_purchase_requests');
export default GameProductPurchaseRequest;

export async function getUserProductPurchase(userId: string, gameId: string, productId?: string) {
    let matchOpt: any = {
        $match: {
            game_id: gameId,
            user_id: userId
        }
    };
    if (productId) {
        matchOpt.$match.id = productId;
    }
    const aggregateQuery: PipelineStage[] = [
        matchOpt,
        {
            $project: {
            _id: 0,
            __v: 0,
            game_id: 0,
            },
        },
        {
            $group: {
            _id: {
                product_id: "$product_id",
                request_period: "$request_period",
            },
            count: {$sum: 1}
            }
        },
        {
            $project: { _id: 0, product_id: '$_id.product_id', period: '$_id.request_period', count: 1 }
        }
    ];
    const results = await GameProductPurchaseRequest.aggregate(aggregateQuery);
    return results;
  }
