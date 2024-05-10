import {Document, Schema, models, model} from 'mongoose'
import connectToMongoDbDev from "@/lib/mongodb/client";

// NFT的分类
export enum NFTCategory {
    TETRA_NFT = 'TETRA_NFT',
    SBT_NFT = 'SBT_NFT'
}

export interface IUserFavouriteNFT extends Document {
    // 用户id
    user_id: string,
    // NFT所在网络
    chain_id: string,
    // NFT合约地址
    contract_address: string,
    // NFT tokenId
    token_id: string,
    // 排序
    sort: number,
    // 创建时间毫秒时间戳
    created_time: number
}

const UserFavouriteNFTSchema = new Schema<IUserFavouriteNFT>({
    user_id: {type: String},
    chain_id: {type: String},
    contract_address: {type: String},
    token_id: {type: String},
    sort: {type: Number},
    created_time: {type: Number},
});

UserFavouriteNFTSchema.index({user_id: 1, chain_id: 1, contract_addr:1, token_id:1}, {unique: true});

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const UserFavouriteNFT = models.UserFavouriteNFT || connection.model<IUserFavouriteNFT>('UserFavouriteNFT', UserFavouriteNFTSchema, 'user_favourite_nfts');
export default UserFavouriteNFT;