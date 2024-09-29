import { AuthorizationType } from '@/lib/authorization/types';
import { Metric } from '@/lib/models/UserMetrics';

export enum QuestType {
  // 绑定钱包
  ConnectWallet = 'connect_wallet',
  // 绑定twitter
  ConnectTwitter = 'connect_twitter',
  // 绑定discord
  ConnectDiscord = 'connect_discord',
  // 绑定telegram
  ConnectTelegram = 'connect_telegram',
  // 绑定steam
  ConnectSteam = 'connect_steam',
  // twitter关注
  FollowOnTwitter = 'follow_on_twitter',
  // 转推
  RetweetTweet = 'retweet_tweet',
  // 点赞
  LikeTweet = 'like_tweet',
  // 评论
  CommentTweet = 'comment_tweet',
  // 第三方回调任务
  ThirdPartyCallback = 'third_party_callback',
  // twitter话题(发推参与话题)
  TwitterTopic = 'twitter_topic',
  // 推文互动(点赞、评论、转推)
  TweetInteraction = 'tweet_interaction',
  // 加入discord社区
  JoinDiscordServer = 'join_discord_server',
  // 持有discord角色
  HoldDiscordRole = 'hold_discord_role',
  // 白名单
  Whitelist = 'whitelist',
  // 用户指标，见集合user_metrics
  UserMetric = 'user_metric',
  // 持有NFT
  HoldNFT = 'hold_nft',
  // 发送discord消息
  SendDiscordMessage = 'send_discord_message',
  // twitter的关注者数
  TwitterFollower = 'twitter_follower',
  // 数数SQL类任务
  ThinkingDataQuery = 'thinking_data_query',
  // 领取2048游戏券
  Claim2048Ticket = 'claim_2048_ticket',
  // 持有徽章SBT
  HoldBadgeSBT = 'hold_badge_sbt',
  // 浏览指定网站
  ViewWebsite = 'view_website',
  // 领取抽奖券
  ClaimLotteryTicket = 'claim_lottery_ticket',
  // twitter关注
  FollowOnTwitterNew = 'follow_on_twitter_new',
  // 加入 Telegram 群组
  JoinTelegramGroup = 'join_telegram_group',
}

// 任务类型与对应拥有的(外部)指标，某些内部的特征指标未列到下面(如Metric.WalletTokenValueLastCalcTime)
export const QuestMetrics = new Map<QuestType, Metric[]>([
  // 连接钱包时，可用的指标是钱包代币价值
  [QuestType.ConnectWallet, [Metric.WalletTokenUsdValue, Metric.WalletNftUsdValue, Metric.WalletAssetUsdValue]],
  // 连接steam时，可用指标为：账号年限、游戏数量、账号价值、账号综合评分
  [
    QuestType.ConnectSteam,
    [Metric.SteamAccountYears, Metric.SteamAccountGameCount, Metric.SteamAccountUSDValue, Metric.SteamAccountRating],
  ],
]);

export enum WhitelistEntityType {
  WalletAddr = 'wallet_addr',
  DiscordId = 'discord_id',
  TwitterId = 'twitter_id',
  GoogleId = 'google_id',
  SteamId = 'steam_id',
  TelegramId = 'telegram_id',
  UserId = 'user_id',
  Email = 'email',
}

export enum QuestRewardType {
  // 固定奖励，奖励数量配置于当前任务中
  Fixed = 'fixed',
  // 范围奖励，奖励数量特定于任务进行动态分配
  Range = 'range',
}

export enum TokenRewardDistributeType {
  // 用户verify任务以后直接发奖
  DirectDistribute = 'direct_distribute',
  // 用户verify任务以后, 统一在指定时间发奖
  AutoRaffle = 'auto_raffle',
  // 用户verify任务以后, 统一手工发奖
  ManualRaffle = 'manual_raffle',
}

export type TokenReward = {
  // 奖励的token id
  token_id: string;
  // 发奖方式
  distribute_type: TokenRewardDistributeType;
  // Token奖励中间状态名称
  distribute_mid_state_name: string;
  // 自动发奖中奖人数
  auto_raffle_count: number;
  // 奖励代币数量
  token_amount_raw: number;
  // 格式化奖励代币数量
  token_amount_formatted: string;
  // 预计奖励的抽奖时间
  estimated_raffle_time: number;
  // 实际抽奖时间
  actual_raffle_time: number;
};

export type ThinkingDataQuery = {
  // 查询的SQL模版，该模版只支持传递一个参数，即用户id
  sql_template: string;
  // 任务地址
  url: string;
  // 任务类型，不填写则为一次性任务
  type?: ThinkingDataQuestType;
  // 奖励类型，fixed为固定奖励，range则需要根据用户的数据进行确定，比如排名，不填写默认固定奖励
  rewardType?: QuestRewardType;
  // 指标
  metric?: Metric;
};

// 发送discord消息(文本频道或者论坛回帖都适用.)
export type SendDiscordMessage = {
  // discord的邀请链接，用户可以通过该链接加入DC
  guild_url: string;
  // 在指定的工会
  guild_id: string;
  // 在指定的频道
  channel_id: string;
  // 最短消息长度
  min_msg_length: number;
  // 发送的开始时间，毫秒时间戳
  start_time: number;
  // 发送的结束时间，毫秒时间戳
  end_time: number;
  // 任务地址
  url: string;
};

export type TwitterTopic = {
  // 关联的话题id，见集合twitter_topic_tweets
  topic_id: string;
  // 任务地址，根据话题参数构建的创建推文的链接
  // 格式：@xxx \n text \n #topic,
  // 如：https://twitter.com/intent/post?text=@twitterapi%20custom%0ashare%0atext&hashtags=example,demo
  url: string;
};

export type TweetInteraction = {
  // 关联的话题id，见集合twitter_topic_tweets
  topic_id: string;
  // 互动的目标推文地址
  tweet_url: string;
  // 互动推文id
  tweet_id: string;
  // 任务地址，用户评论推文的intent地址，点赞或者转推由API自动进行.
  url: string;
};

// 关注
export type FollowOnTwitter = {
  // 关注的目标用户的handle，如@Moonveil_Studio
  username: string;
  // 目标用户的twitter id，如1669209055024259074
  target_twitter_id: string;
  // 任务地址
  url: string;
};

// 转推
export type RetweetTweet = {
  // 目标推文地址
  tweet_url: string;
  // 推文id，用于构建intent地址
  tweet_id: string;
  // 任务地址
  url: string;
};

// 点赞推文
export type LikeTweet = {
  // 目标推文地址
  tweet_url: string;
  // 推文id，用于构建intent地址
  tweet_id: string;
  // 任务地址
  url: string;
};

// 评论推文
export type CommentTweet = {
  // 目标推文地址
  tweet_url: string;
  // 推文id，用于构建intent地址
  tweet_id: string;
  // 任务地址
  url: string;
};

// 加入discord社区
export type JoinDiscordServer = {
  // discord的邀请链接，用户可以通过该链接加入DC
  guild_url: string;
  // 在指定的工会
  guild_id: string;
  // 任务地址
  url: string;
};

// 加入telegram群组
export type JoinTelegramGroup = {
  // 在指定的群组
  chat_id: string;
  // 任务地址
  url: string;
};

// 持有discord角色
export type HoldDiscordRole = {
  // discord的邀请链接，用户可以通过该链接加入DC
  guild_url: string;
  // 在指定的工会
  guild_id: string;
  // 拥有的角色
  role_ids: string[];
  // 任务地址
  url: string;
};

// 白名单
export type Whitelist = {
  // 白名单id
  whitelist_id: string;
  // 任务地址，可能为空
  url: string;
};

// 持有NFT
export type HoldNFT = {
  // NFT所在的链id
  chain_id: string;
  // NFT所在的合约地址
  contract_addr: string;
  // 任务地址，可为空
  url: string;
};

// 用户指标
export type UserMetric = {
  // 指标名称，如 "register_astrark"
  metric: string;
  // 指标需要满足的值
  value: boolean | number | string;
  // 操作符
  operator: '==' | '>=' | '<=' | '>' | '<';
  // 任务地址，可为空
  url: string;
};

// 检查任务完成结果
export type checkClaimableResult = {
  // 是否可以申领任务奖励
  claimable: boolean;
  // 是否需要用户授权(任务需要用户先授权再进行任务申领检查)
  require_authorization?: AuthorizationType;
  // 未能领取任务奖励情况下的提醒
  tip?: string;
  // 传递自定义信息
  extra?: any;
};

// 领取任务奖励结果
export type claimRewardResult = {
  // 任务是否已经领取奖励
  verified: boolean;
  // 是否需要用户授权(任务需要用户先授权再进行任务申领检查)
  require_authorization?: AuthorizationType;
  // 领取的奖励数量
  claimed_amount?: number;
  // 未能领取任务奖励情况下的提醒
  tip?: string;
  // 传递自定义信息
  extra?: any;
};

// 持有徽章SBT
export type HoldBadgeSBT = {
  badge_id: string;
  badge_level: string;
};

export type ThirdPartyCallback = {
  endpoint: string;
  custom_headers: ThirdPartyCallbackRequestHeaders[];
};

export type ThirdPartyCallbackRequestHeaders = {
  name: string;
  value: any;
};

export type TokenDispatch = {
  chain_id: string;
  token_address: string;
  whitelist_id: string;
};

export enum ThinkingDataQuestType {
  // 固定奖励，奖励数量配置于当前任务中
  Daily = 'daily',
  // 范围奖励，奖励数量特定于任务进行动态分配
  Once = 'once',
}

export type GameTicketReward = {
  // 游戏ID
  game_id: string,
  // 奖励的门票数量
  amount: number,
  // 门票过期时间
  expired_at: number
};

export type NodeReward = {
  // 节点等级
  node_tier: string,
  // 节点数量
  node_amount: number,
  // 领奖时的提醒
  notification_id?: string,
  // 中奖人数
  number_of_winners?: number,
  // 预估抽奖时间
  estimated_raffle_time?: number,
  // 实际抽奖时间
  actual_raffle_time?: number,
};