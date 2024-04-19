import {AuthorizationType} from "@/lib/authorization/types";
import {Metric} from "@/lib/models/UserMetrics";

export enum QuestType {
    ConnectWallet = "connect_wallet",
    ConnectTwitter = "connect_twitter",
    ConnectDiscord = "connect_discord",
    ConnectTelegram = "connect_telegram",
    ConnectSteam = "connect_steam",
    FollowOnTwitter = "follow_on_twitter",
    RetweetTweet = "retweet_tweet",
    LikeTweet = "like_tweet",
    CommentTweet = "comment_tweet",
    JoinDiscordServer = "join_discord_server",
    HoldDiscordRole = "hold_discord_role",
    Whitelist = "whitelist",
    UserMetric = "user_metric",
    HoldNFT = "hold_nft",
    SendDiscordMessage = "send_discord_message",
    TwitterFollower = "twitter_follower",
}

// 任务类型与对应拥有的(外部)指标，某些内部的特征指标未列到下面(如Metric.WalletTokenValueLastCalcTime)
export const QuestMetrics = new Map<QuestType, Metric[]>([
    // 连接钱包时，可用的指标是钱包代币价值
    [QuestType.ConnectWallet, [Metric.WalletTokenUsdValue, Metric.WalletNftUsdValue, Metric.WalletAssetUsdValue]],
    // 连接steam时，可用指标为：账号年限、游戏数量、账号价值、账号综合评分
    [QuestType.ConnectSteam, [Metric.SteamAccountYears, Metric.SteamAccountGameCount, Metric.SteamAccountUSDValue, Metric.SteamAccountRating]]
]);

export enum WhitelistEntityType {
    WalletAddr = "wallet_addr",
    DiscordId = "discord_id",
    TwitterId = "twitter_id",
    GoogleId = "google_id",
    SteamId = "steam_id",
    UserId = "user_id",
    Email = "email",
}

export enum QuestRewardType {
    // 固定奖励，奖励数量配置于当前任务中
    Fixed = "fixed",
    // 范围奖励，奖励数量特定于任务进行动态分配
    Range = "range",
}

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
}

// 关注
export type FollowOnTwitter = {
    // 关注的目标用户的handle，如@Moonveil_Studio
    username: string;
    // 目标用户的twitter id，如1669209055024259074
    target_twitter_id: string;
    // 任务地址
    url: string;
}

// 转推
export type RetweetTweet = {
    // 目标推文地址
    tweet_url: string;
    // 推文id，用于构建intent地址
    tweet_id: string;
    // 任务地址
    url: string;
}

// 点赞推文
export type LikeTweet = {
    // 目标推文地址
    tweet_url: string;
    // 推文id，用于构建intent地址
    tweet_id: string;
    // 任务地址
    url: string;
}

// 评论推文
export type CommentTweet = {
    // 目标推文地址
    tweet_url: string;
    // 推文id，用于构建intent地址
    tweet_id: string;
    // 任务地址
    url: string;
}

// 加入discord社区
export type JoinDiscordServer = {
    // discord的邀请链接，用户可以通过该链接加入DC
    guild_url: string;
    // 在指定的工会
    guild_id: string;
    // 任务地址
    url: string;
}

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
}

// 白名单
export type Whitelist = {
    // 白名单id
    whitelist_id: string;
    // 任务地址，可能为空
    url: string;
}

// 持有NFT
export type HoldNFT = {
    // NFT所在的链id
    chain_id: string;
    // NFT所在的合约地址
    contract_addr: string;
    // 任务地址，可为空
    url: string;
}

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
}

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
}

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
}