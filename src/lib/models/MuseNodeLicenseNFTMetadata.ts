import {Document, Schema, models, model} from 'mongoose'
import connectToMongoDbDev from "@/lib/mongodb/client";

export interface IMuseNodeLicenseNFTMetadata extends Document {
    // NFT名称
    name: string,
    // 描述
    description: string,
    // 动画URL
    animation_url: string,
    // 属性
    attributes: any[],
}

const MuseNodeLicenseNFTMetadataSchema = new Schema<IMuseNodeLicenseNFTMetadata>({
  name: {type: String},
  description: {type: String},
  animation_url: {type: String},
  attributes: { type: Schema.Types.Mixed },
});


// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const MuseNodeLicenseNFTMetadata = models.MuseNodeLicenseNFTMetadata || connection.model<IMuseNodeLicenseNFTMetadata>('MuseNodeLicenseNFTMetadata', MuseNodeLicenseNFTMetadataSchema, 'muse_node_license_nft_metadata');
export default MuseNodeLicenseNFTMetadata;