import {IUserWallet} from "@/lib/models/UserWallet";
import {IUserSteam} from "@/lib/models/UserSteam";
import {IOAuthToken} from "@/lib/models/OAuthToken";
import {AuthorizationType} from "@/lib/authorization/types";
import {IUserTwitter} from "@/lib/models/UserTwitter";
import {IUserDiscord} from "@/lib/models/UserDiscord";


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
    GamePreRegister = "game_pre_register",
    HoldNFT = "hold_nft",
}

export enum QuestRewardType {
    // 固定奖励，奖励数量配置于当前任务中
    Fixed = "fixed",
    // 范围奖励，奖励数量特定于任务进行动态分配
    Range = "range",
}

export type FollowOnTwitter = {
    // 关注的目标用户
    username: string;
}

export type RetweetTweet = {
    // 目标推文地址
    tweet_url: string;
}

export type HoldDiscordRole = {
    // discord的邀请链接，用户可以通过该链接加入DC
    guild_url: string;
    // 在指定的工会
    guild_id: string;
    // 拥有的角色
    role_ids: string[];
}

export type Whitelist = {
    // 白名单id
    whitelist_id: string;
}

export type HoldNFT = {
    // NFT所在的链id
    chain_id: string;
    // NFT所在的合约地址
    contract_addr: string;
    // NFT的token id
    token_id: number | null;
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
    // 任务是否已经领取
    claimed: boolean;
    // 是否需要用户授权(任务需要用户先授权再进行任务申领检查)
    require_authorization?: AuthorizationType;
    // 领取的奖励数量
    claimed_amount?: number;
    // 未能领取任务奖励情况下的提醒
    tip?: string;
}