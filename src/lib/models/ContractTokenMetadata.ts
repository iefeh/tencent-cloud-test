import {Document, Schema, models, model} from 'mongoose'
import connectToMongoDbDev from "@/lib/mongodb/client";

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

const ContractTokenMetadataSchema = new Schema<IContractTokenMetadata>({
    chain_id: {type: String},
    contract_address: {type: String},
    token_id: {type: Number},
    token_uri: {type: String},
    token_uri_formatted: {type: String},
    metadata: Schema.Types.Mixed,
    created_time: {type: Number},
});

ContractTokenMetadataSchema.index({chain_id: 1, contract_address: 1, token_id: 1});

// 使用既有模型或者新建模型
const connection = await connectToMongoDbDev();
const ContractTokenMetadata = models.ContractTokenMetadata || connection.model<IContractTokenMetadata>('ContractTokenMetadata', ContractTokenMetadataSchema, 'contract_token_metadata');
export default ContractTokenMetadata;