import {Document, Schema, models, model} from 'mongoose'
import connectToMongoDbDev from "@/lib/mongodb/client";

// 枚举合约分类，我们平台的合约类型，如SBT、DESTINY NFT等
export enum ContractCategory {
    SBT = 'SBT',
    DESTINY_TETRA = 'DESTINY_TETRA',
    ETERNITY_TETRA = 'ETERNITY_TETRA',
}

export interface IContract extends Document {
    // 链id
    chain_id: string;
    // 合约地址
    address: string;
    // 合约名称
    name: string;
    // 合约类别
    category: ContractCategory;
}

const ContractSchema = new Schema<IContract>({
    chain_id: {type: String, required: true},
    address: {type: String, required: true},
    name: {type: String, required: true},
    category: {type: String, required: true},
});


ContractSchema.index({chain_id: 1, category: 1}, {unique: true});

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const Contract = models.Contract || connection.model<IContract>('Contract', ContractSchema, 'contracts');
export default Contract;