import {Document, Schema, models, model} from 'mongoose'

// 合约代币元信息
export interface IContractTokenMetadata extends Document {
    chain_id: string;
    contract_address: string;
    token_id: number;
    token_uri: string;
    token_uri_formatted: string;
    metadata: any;
    created_time: number;
}

const ContractNFTSchema = new Schema<IContractTokenMetadata>({
    chain_id: {type: String},
    contract_address: {type: String},
    token_id: {type: Number},
    token_uri: {type: String},
    token_uri_formatted: {type: String},
    metadata: Schema.Types.Mixed,
    created_time: {type: Number},
});

// 使用既有模型或者新建模型
const ContractTokenMetadata = models.ContractTokenMetadata || model<IContractTokenMetadata>('ContractTokenMetadata', ContractNFTSchema, 'contract_token_metadata');
export default ContractTokenMetadata;