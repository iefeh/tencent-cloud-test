import {Document, Schema, models, model} from 'mongoose'
import connectToMongoDbDev from "@/lib/mongodb/client";

// 合约NFT
export interface IContractNFT extends Document {
    chain_id: string;
    block_number: number;
    transaction_id: string;
    transaction_status: string;
    contract_address: string;
    token_id: number;
    wallet_addr: string;
    created_time: number;
    confirmed_time: number;
    deleted_time: number | null
}

const ContractNFTSchema = new Schema<IContractNFT>({
    chain_id: {type: String},
    block_number: {type: Number},
    transaction_id: {type: String},
    transaction_status: {type: String},
    contract_address: {type: String},
    token_id: {type: Number},
    wallet_addr: {type: String},
    created_time: {type: Number},
    confirmed_time: {type: Number},
    deleted_time: {type: Number, default: null},
});

ContractNFTSchema.index({transaction_id: 1});
ContractNFTSchema.index({wallet_addr: 1});
ContractNFTSchema.index({chain_id: 1, contract_address: 1, wallet_addr: 1});

// 使用既有模型或者新建模型
const connection = await connectToMongoDbDev();
const ContractNFT = models.ContractNFT || connection.model<IContractNFT>('ContractNFT', ContractNFTSchema, 'contract_nft');
export default ContractNFT;