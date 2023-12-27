import {Document, Schema, models, model} from 'mongoose'

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
    id: string,
    contract_id: string,
    inner_id: string,
    chain: string,
    name: string,
    description: string,
    content_type: string,
    content: string,
    thumbnail_url: string,
    total_supply: number,
    detail_url: string,
    attributes: any[],
    collection_id: string,
    pay_token: PayToken,
    contract_name: string,
    is_erc1155: boolean,
    is_erc721: boolean,
    amount: number,
    usd_price: number
};

type PayToken = {
    id: string,
    chain: string,
    name: string,
    symbol: string,
    display_symbol: string | null,
    optimized_symbol: string,
    decimals: number,
    logo_url: string,
    protocol_id: string,
    price: number,
    price_24h_change: number | null,
    credit_score: number,
    is_verified: boolean,
    is_scam: boolean,
    is_suspicious: boolean,
    is_core: boolean,
    is_wallet: boolean,
    time_at: number,
    amount: number,
    date_at: string
};


export interface IWalletAsset extends Document {
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
    // 创建时间毫秒时间戳
    created_time: number,
    // 更新时间毫秒时间戳
    updated_time: number | null,
}

const WalletAssetSchema = new Schema<IWalletAsset>({
    wallet_addr: {type: String, required: true},
    total_usd_value: {type: Number},
    token_usd_value: {type: Number},
    nft_usd_value: {type: Number},
    tokens: Schema.Types.Mixed,
    nfts: Schema.Types.Mixed,
    created_time: {type: Number},
    updated_time: {type: Number},
});

WalletAssetSchema.index({wallet_addr: 1}, {unique: true});

// 使用既有模型或者新建模型
const WalletAsset = models.WalletAsset || model<IWalletAsset>('WalletAsset', WalletAssetSchema, 'wallet_assets');
export default WalletAsset;
