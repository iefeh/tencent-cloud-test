import {Document, Schema, models, model} from 'mongoose'
import connectToMongoDbDev from "@/lib/mongodb/client";

// 枚举合约分类，我们平台的合约类型，如SBT、DESTINY NFT等
export enum ContractCategory {
    // 徽章SBT合约
    SBT = 'SBT',
    // Tetra系列NFT合约
    TETRA_SERIES = 'TETRA_SERIES',
    // 通用抽奖合约
    LOTTERY = 'LOTTERY',
}

// 子类型
export enum ContractSubCategory {
    // 徽章
    BADGE = 'BADGE',
    DESTINY_NFT = 'DESTINY_NFT',
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
    // 子类别
    sub_category: ContractSubCategory;
    // 浏览器URL
    expolorer_url: string;
}

const ContractSchema = new Schema<IContract>({
    chain_id: {type: String, required: true},
    address: {type: String},
    name: {type: String},
    category: {type: String},
    sub_category: {type: String},
    expolorer_url: {type: String}
});


ContractSchema.index({chain_id: 1, category: 1}, {unique: true});

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const Contract = models.Contract || connection.model<IContract>('Contract', ContractSchema, 'contracts');
export default Contract;


// 查询指定链的抽奖合约
export async function findLotteryContract(chain_id: string): Promise<IContract | null> {
    return Contract.findOne({chain_id, category: ContractCategory.LOTTERY});
}