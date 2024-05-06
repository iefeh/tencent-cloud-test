import {Document, Schema, models, model} from 'mongoose'
import connectToMongoDbDev from "@/lib/mongodb/client";

export interface IContract extends Document {
    // 链id
    chain_id: string;
    // 合约地址
    address: string;
    // 合约名称
    name: string;
}

const ContractSchema = new Schema<IContract>({
    user_id: {type: String, required: true},
    wallet_addr: {type: String, required: true},
    created_time: {type: Number, required: true},
    deleted_time: {type: Number, default: null},
});

// 同一个用户不允许绑定多个钱包
ContractSchema.index({user_id: 1, deleted_time: 1}, {unique: true});
// 同一个钱包不允许多绑定
ContractSchema.index({wallet_addr: 1, deleted_time: 1}, {unique: true});

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const Contract = models.Contract || connection.model<IContract>('Contract', ContractSchema, 'contract');
export default Contract;