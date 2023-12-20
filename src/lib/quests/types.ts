import {IUserWallet} from "@/lib/models/UserWallet";
import {IUserSteam} from "@/lib/models/UserSteam";
import {IOAuthToken} from "@/lib/models/OAuthToken";
import {AuthorizationType} from "@/lib/authorization/types";

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

export type verifyQuestResult = {
    // 是否可以申请任务
    claimable: boolean;
    // 是否需要用户授权
    require_authorization?: AuthorizationType;
    // 用户绑定的钱包，仅当任务类型为connect_wallet时存在
    wallet?: IUserWallet;
    // 用户绑定的steam，仅当任务类型为connect_steam时存在
    steam?: IUserSteam;
    // 用户的授权token，仅当任务类型为connect_discord或connect_twitter时存在
    auth_token?: IOAuthToken;
}