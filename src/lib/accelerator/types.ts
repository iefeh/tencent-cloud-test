// 奖励加速器类型
export enum RewardAcceleratorType {
    // NFT持有者，用户持有特定的NFT以获得额外的奖励
    NFTHolder = 'nft_holder',
    // 徽章持有者，用户持有特定的NFT以获得额外的奖励
    BadgeHolder = 'badge_holder',
}

// nft_holder奖励加速器属性
export type NFTHolderAcceleratorProperties = {
    // 链id
    chain_id: string,
    // NFT合约地址
    contract_address: string,
    // 奖励加成，百分比，如0.1表示10%
    reward_bonus: number,
    // 是否支持NFT奖励叠加，如支持时，获得奖励加成为  NFT持有数量 * reward_bonus
    support_stacking: boolean,
    // NFT持有的最短时长，单位秒
    min_hold_duration: number,
    // NFT的市场链接
    nft_market_url: string,
}

// NFT持有者奖励
export type NftHolderReward = {
    // 用户钱包地址
    wallet_address: string,
    // 基础奖励的mb数量
    base_moon_beam: number,
    // 额外奖励的mb数量
    bonus_moon_beam: number,
}

// badge_holder奖励加速器属性
export type BadgeHolderAcceleratorProperties = {
    badge_id: string,
    // 是否支持NFT奖励叠加，如支持时，获得奖励加成为  NFT持有数量 * reward_bonus
    support_stacking: boolean,
    // 徽章加速器配置
    series: BadgeHolderAcceleratorSeries[]
}

//徽章加速器各等级对应加速
export type BadgeHolderAcceleratorSeries = {
    //等级
    lv: number,
    // 奖励加成，百分比，如0.1表示10%
    reward_bonus: number
}

// 徽章持有者奖励
export type BadgeHolderReward = {
    // 徽章等级
    lv: number,
    // 基础奖励的mb数量
    base_moon_beam: number,
    // 额外奖励的mb数量
    bonus_moon_beam: number,
}
