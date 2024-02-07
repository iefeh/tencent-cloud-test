// 奖励加速器类型
export enum RewardAcceleratorType {
    // NFT持有者，用户持有特定的NFT以获得额外的奖励
    NFTHolder = 'nft_holder',
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