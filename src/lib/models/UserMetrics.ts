import { Document, Schema, models, model } from 'mongoose';
import { ConnectTwitterQuest } from '@/lib/quests/implementations/connectTwitterQuest';
import connectToMongoDbDev from '@/lib/mongodb/client';
import { sendBadgeCheckMessage, sendBadgeCheckMessages } from '@/lib/kafka/client';

// TODO：添加新的metric，一定需要同时修改IUserMetrics与UserMetricsSchema
export enum Metric {
  // 预约AstrArk
  PreRegisterAstrArk = 'pre_register_astrark',
  AstrarkHeroURL = 'astrark_hero_url',

  // 钱包指标使用的资产id
  WalletAssetId = 'wallet_asset_id',
  // 钱包token价值
  WalletTokenUsdValue = 'wallet_token_usd_value',
  // 钱包NFT价值
  WalletNftUsdValue = 'wallet_nft_usd_value',
  // 钱包资产价值 = 钱包token价值+WalletNFTUSDValue
  WalletAssetUsdValue = 'wallet_asset_usd_value',
  // 钱包资产价值上次刷新时间(可用该时间限制客户端计算钱包价值的间隔)
  WalletAssetValueLastRefreshTime = 'wallet_asset_value_last_refresh_time',

  // 用户steam资产id
  SteamAssetId = 'steam_asset_id',
  // Steam账号年限
  SteamAccountYears = 'steam_account_years',
  // Steam账号游戏数
  SteamAccountGameCount = 'steam_account_game_count',
  // Steam账户的美金价值，按照游戏的价格+当前用户拥有的游戏进行价值计算
  SteamAccountUSDValue = 'steam_account_usd_value',
  // Steam账户评分
  SteamAccountRating = 'steam_account_rating',

  // 初出茅庐徽章，其他的加入社区/关注某人，按照完成任务算.
  TwitterConnected = 'twitter_connected',
  DiscordConnected = 'discord_connected',
  SteamConnected = 'steam_connected',
  WalletConnected = 'wallet_connected',
  GoogleConnected = 'google_connected',
  DiscordJoinedMoonveil = 'discord_joined_moonveil',
  TwitterFollowedMoonveil = 'twitter_followed_moonveil',
  TwitterFollowedAstrArk = 'twitter_followed_astrark',

  // 奔走相告徽章，完成转推次数
  RetweetCount = 'retweet_count',
}

// 用户内部指标，存放单独的集合
export interface IUserMetrics extends Document {
  // 用户id
  user_id: string;
  // 是否预约astrark游戏
  pre_register_astrark: boolean;
  // astrark游戏英雄地址
  astrark_hero_url: string;
  // 绑定钱包拥有的token价值
  wallet_asset_id: string;
  wallet_token_usd_value: number;
  wallet_nft_usd_value: number;
  wallet_asset_usd_value: number;
  // 钱包token价值上次计算时间
  wallet_asset_value_last_refresh_time: number;

  steam_asset_id: string;
  // Steam账号年限
  steam_account_years: number;
  // Steam账号游戏数
  steam_account_game_count: number;
  // Steam账户的美金价值，按照游戏的价格+当前用户拥有的游戏进行价值计算
  steam_account_usd_value: number;
  // Steam账户评分
  steam_account_rating: number;

  // 用户平台指标
  twitterConnected: boolean;
  discordConnected: boolean;
  steamConnected: boolean;
  walletConnected: boolean;
  googleConnected: boolean;
  discordJoinedMoonveil: boolean;
  twitterFollowedMoonveil: boolean;
  twitterFollowedAstrArk: boolean;

  // 转推次数
  retweet_count: number;

  // 创建时间毫秒时间戳
  created_time: number;
}

const UserMetricsSchema = new Schema<IUserMetrics>({
  user_id: { type: String, required: true },
  pre_register_astrark: { type: Boolean },
  astrark_hero_url: { type: String },
  wallet_asset_id: { type: String },
  wallet_token_usd_value: { Type: Number },
  wallet_nft_usd_value: { Type: Number },
  wallet_asset_usd_value: { Type: Number },
  wallet_asset_value_last_refresh_time: { Type: Number },
  steam_asset_id: { type: String },
  steam_account_years: { Type: Number },
  steam_account_game_count: { Type: Number },
  steam_account_usd_value: { Type: Number },
  steam_account_rating: { Type: Number },
  twitterConnected: { Type: Boolean },
  discordConnected: { Type: Boolean },
  steamConnected: { Type: Boolean },
  walletConnected: { Type: Boolean },
  googleConnected: { Type: Boolean },
  discordJoinedMoonveil: { Type: Boolean },
  twitterFollowedMoonveil: { Type: Boolean },
  twitterFollowedAstrArk: { Type: Boolean },
  retweet_count: { Type: Number },
  created_time: { type: Number, required: true },
});

UserMetricsSchema.index({ user_id: 1 }, { unique: true });

// 使用既有模型或者新建模型
const connection = connectToMongoDbDev();
const UserMetrics =
  models.UserMetrics || connection.model<IUserMetrics>('UserMetrics', UserMetricsSchema, 'user_metrics');
export default UserMetrics;

// 设置用户的指标
export async function createUserMetric(userId: string, metric: Metric, value: string | number | boolean) {
  const result = UserMetrics.updateOne(
    { user_id: userId },
    {
      $set: { [metric]: value },
      $setOnInsert: { created_time: Date.now() },
    },
    { upsert: true },
  );

  sendBadgeCheckMessage(userId, metric);
  
  return result;
}

// 设置用户的指标
export async function createUserMetrics(userId: string, metrics: { [key: string]: string | number | boolean }) {
  let setOperations: { [key: string]: string | number | boolean } = {};
  for (const [metric, value] of Object.entries(metrics)) {
    setOperations[metric] = value;
  }
  const result = UserMetrics.updateOne(
    { user_id: userId },
    {
      $set: setOperations,
      $setOnInsert: { created_time: Date.now() },
    },
    { upsert: true },
  );

  sendBadgeCheckMessages(userId, setOperations);

  return result;
}
