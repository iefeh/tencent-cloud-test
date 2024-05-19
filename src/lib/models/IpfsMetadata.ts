import {Document, Schema, models, model} from 'mongoose'
import connectToMongoDbDev from "@/lib/mongodb/client";

// ipfs元信息
export interface IIpfsMetadata extends Document {
    ipfs_hash: string;
    ipfs_access_url: string;
    metadata: any;
    created_time: number;
}

const IpfsMetadataSchema = new Schema<IIpfsMetadata>({
    ipfs_hash: {type: String},
    ipfs_access_url: {type: String},
    metadata: Schema.Types.Mixed,
    created_time: {type: Number},
});

IpfsMetadataSchema.index({ipfs_hash: 1}, {unique: true});

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const IpfsMetadata = models.IpfsMetadata || connection.model<IIpfsMetadata>('IpfsMetadata', IpfsMetadataSchema, 'ipfs_metadata');
export default IpfsMetadata;