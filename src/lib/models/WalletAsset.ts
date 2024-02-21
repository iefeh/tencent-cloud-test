import {Document, Schema, models, model} from 'mongoose'
import connectToMongoDbDev from "@/lib/mongodb/client";

export type WalletToken = {
    // 所在链id，如eth
    id: string,
    // 社区标识符id，如以太坊为1
    community_id: number,
    // 所在链的名称
    name: string,
    // 链的图标URL
    logo_url: string,
    // 原生token id
    native_token_id: string,
    // 原生token的地址
    wrapped_token_id: string,
    // 用户资产的美金价值
    usd_value: number,
}

export type WalletNFT = {
    collection: {
        id: string,
        slug: string,
        name: string,
        floorAskPrice: any,
    },
    ownership: {
        tokenCount: string,
        onSaleCount: string,
    }
};

export interface IWalletAsset extends Document {
    // 资产id，每次资产校验都会生成一份id，集合唯一
    id: string,
    // 校验资产的用户
    user_id: string,
    // 用户绑定的钱包地址
    wallet_addr: string,
    // 美金价值
    total_usd_value: number,
    token_usd_value: number,
    nft_usd_value: number,
    // 钱包的token
    tokens: WalletToken[],
    // 钱包的nft
    nfts: WalletNFT[],
    reverified: boolean,
    reservoir_value: number,
    // 创建时间毫秒时间戳
    created_time: number,
}

const WalletAssetSchema = new Schema<IWalletAsset>({
    id: {type: String, required: true},
    user_id: {type: String, required: true},
    wallet_addr: {type: String, required: true},
    total_usd_value: {type: Number},
    token_usd_value: {type: Number},
    nft_usd_value: {type: Number},
    tokens: Schema.Types.Mixed,
    nfts: Schema.Types.Mixed,
    reverified: {type: Boolean},
    reservoir_value: {type: Number},
    created_time: {type: Number},
});

WalletAssetSchema.index({id: 1}, {unique: true});
WalletAssetSchema.index({wallet_addr: 1});
WalletAssetSchema.index({user_id: 1});

// 使用既有模型或者新建模型
const connection = await connectToMongoDbDev();
const WalletAsset = models.WalletAsset || connection.model<IWalletAsset>('WalletAsset', WalletAssetSchema, 'wallet_assets');
export default WalletAsset;
