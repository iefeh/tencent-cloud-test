export type FollowOnTwitter = {
    // 关注的目标用户
    username: string;
}

export type RetweetTweet = {
    // 目标推文地址
    tweet_url: string;
}

export type HoldDiscordRole = {
    // 在指定的工会
    guild_id: string;
    // 拥有的角色
    role_ids: string;
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