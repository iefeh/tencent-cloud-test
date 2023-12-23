import {AuthorizationType} from "@/lib/authorization/types";


export enum QuestType {
    ConnectWallet = "connect_wallet",
    ConnectTwitter = "connect_twitter",
    ConnectDiscord = "connect_discord",
    ConnectTelegram = "connect_telegram",
    ConnectSteam = "connect_steam",
    FollowOnTwitter = "follow_on_twitter",
    RetweetTweet = "retweet_tweet",
    HoldDiscordRole = "hold_discord_role",
    Whitelist = "whitelist",
    UserMetric = "user_metric",
    HoldNFT = "hold_nft",
}

export enum QuestRewardType {
    // 固定奖励，奖励数量配置于当前任务中
    Fixed = "fixed",
    // 范围奖励，奖励数量特定于任务进行动态分配
    Range = "range",
}

// 关注
export type FollowOnTwitter = {
    // 关注的目标用户
    username: string;
}

// 转推
export type RetweetTweet = {
    // 目标推文地址
    tweet_url: string;
}

// 持有discord角色
export type HoldDiscordRole = {
    // discord的邀请链接，用户可以通过该链接加入DC
    guild_url: string;
    // 在指定的工会
    guild_id: string;
    // 拥有的角色
    role_ids: string[];
}

// 白名单
export type Whitelist = {
    // 白名单id
    whitelist_id: string;
}

// 持有NFT
export type HoldNFT = {
    // NFT所在的链id
    chain_id: string;
    // NFT所在的合约地址
    contract_addr: string;
    // NFT的token id
    token_id: number | null;
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
}