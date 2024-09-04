import {Document, Schema, models, model} from 'mongoose'
import connectToMongoDbDev from "@/lib/mongodb/client";

export interface IBlockChain extends Document {
    chain_id: string
    icon_url: string;
    explorer_url: string;
    private_rpc_url: string;
    chain_layer: string;
}

const BlockChainSchema = new Schema<IBlockChain>({
    chain_id: { type: String, required: true },
    icon_url: { type: String, required: true },
    explorer_url: { type: String, required: true },
    private_rpc_url: { type: String, required: true },
    chain_layer: { type: String },
});

BlockChainSchema.index({ product_id: 1 });
BlockChainSchema.index({ user_id: 1, client_id: 1 });

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const BlockChain = models.BlockChain || connection.model<IBlockChain>('BlockChain', BlockChainSchema, 'block_chains');
export default BlockChain;