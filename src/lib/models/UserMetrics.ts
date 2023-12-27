import {Document, Schema, models, model} from 'mongoose'

// TODO：添加新的metric，一定需要同时修改IUserMetrics与UserMetricsSchema
export enum Metric {
    // 预约AstrArk
    PreRegisterAstrArk = "pre_register_astrark",

    // 钱包token价值
    WalletTokenUsdValue = "wallet_token_usd_value",
    // 钱包NFT价值
    WalletNftUsdValue = "wallet_nft_usd_value",
    // 钱包资产价值 = 钱包token价值+WalletNFTUSDValue
    WalletAssetUsdValue = "wallet_asset_usd_value",
    // 钱包资产价值上次刷新时间(可用该时间限制客户端计算钱包价值的间隔)
    WalletAssetValueLastRefreshTime = "wallet_asset_value_last_refresh_time",

    // Steam账号年限
    SteamAccountYears = "steam_account_years",
    // Steam账号游戏数
    SteamAccountGameCount = "steam_account_game_count",
    // Steam账户的美金价值，按照游戏的价格+当前用户拥有的游戏进行价值计算
    SteamAccountUSDValue = "steam_account_usd_value",
    // Steam账户评分
    SteamAccountRating = "steam_account_rating"
}

// 用户内部指标，存放单独的集合
export interface IUserMetrics extends Document {
    // 用户id
    user_id: string,
    // 是否预约astrark游戏
    pre_register_astrark: boolean,
    // 绑定钱包拥有的token价值
    wallet_token_usd_value: number,
    wallet_nft_usd_value: number,
    wallet_asset_usd_value: number,
    // 钱包token价值上次计算时间
    wallet_asset_value_last_refresh_time: number,
    // Steam账号年限
    steam_account_years: number,
    // Steam账号游戏数
    steam_account_game_count: number,
    // Steam账户的美金价值，按照游戏的价格+当前用户拥有的游戏进行价值计算
    steam_account_usd_value: number,
    // Steam账户评分
    steam_account_rating: number,
    // 创建时间毫秒时间戳
    created_time: number,
}

const UserMetricsSchema = new Schema<IUserMetrics>({
    user_id: {type: String, required: true},
    pre_register_astrark: {type: Boolean},
    wallet_token_usd_value: {Type: Number},
    wallet_nft_usd_value: {Type: Number},
    wallet_asset_usd_value: {Type: Number},
    wallet_asset_value_last_refresh_time: {Type: Number},
    steam_account_years: {Type: Number},
    steam_account_game_count: {Type: Number},
    steam_account_usd_value: {Type: Number},
    steam_account_rating: {Type: Number},
    created_time: {type: Number, required: true},
});

UserMetricsSchema.index({user_id: 1}, {unique: true});

// 使用既有模型或者新建模型
const UserMetrics = models.UserMetrics || model<IUserMetrics>('UserMetrics', UserMetricsSchema, 'user_metrics');
export default UserMetrics;

// 设置用户的指标
export async function createUserMetric(userId: string, metric: Metric, value: string | number | boolean) {
    await UserMetrics.updateOne({user_id: userId}, {
        $set: {[metric]: value},
        $setOnInsert: {created_time: Date.now()},
    }, {upsert: true});
}