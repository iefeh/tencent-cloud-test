import { Accelerator } from "@/lib/accelerator/implementations/base";
import { IRewardAccelerator } from "@/lib/models/RewardAccelerator";
import { NFTHolderAcceleratorProperties, NftHolderReward } from "@/lib/accelerator/types";
import ContractNFT from "@/lib/models/ContractNFT";
import { redis } from "@/lib/redis/client";

// NFT持有者加速器，用户持有NFT后，可以获得额外的MB奖励
export class NftHolderAccelerator extends Accelerator<NftHolderReward> {
    constructor(accelerator: IRewardAccelerator) {
        super(accelerator);
    }

    // 加速奖励， 通过用户持有的NFT数量，计算奖励加成
    async accelerate<U extends NftHolderReward>(reward: U): Promise<U> {
        if (reward.base_moon_beam <= 0) {
            return reward;
        }

        // 检查用户持有的已确认的NFT数量
        const cachedKey = `accelerator_cached_nft_${reward.wallet_address}`;
        let nfts: any[];
        let nftsString = await redis.get(cachedKey);
        if (nftsString) {
            nfts = JSON.parse(nftsString);
        } else {
            const filter: any = {
                wallet_addr: reward.wallet_address,
                transaction_status: "confirmed",
                deleted_time: null
            }
            nfts = await ContractNFT.find(filter, { _id: 0, token_id: 1, chain_id: 1, contract_address: 1, created_time: 1 });
            await redis.setex(cachedKey, 60, JSON.stringify(nfts));
        }

        // 获取用户持有的NFT数量
        const props = this.accelerator.properties as NFTHolderAcceleratorProperties;
        let nftCount: number;
        if (props.min_hold_duration) {
            nftCount = nfts.filter(n => n.chain_id == props.chain_id && n.contract_address == props.contract_address && Number(n.created_time) <= (Date.now() - props.min_hold_duration * 1000)).length;
        } else {
            nftCount = nfts.filter(n => n.chain_id == props.chain_id && n.contract_address == props.contract_address).length;
        }

        // 计算奖励加成
        if (props.support_stacking) {
            reward.bonus_moon_beam = Math.ceil(reward.base_moon_beam * props.reward_bonus * nftCount);
        } else {
            if (nftCount > 0) {
                reward.bonus_moon_beam = Math.ceil(reward.base_moon_beam * props.reward_bonus);
            } else {
                reward.bonus_moon_beam = 0;
            }
        }
        return reward;
    }
}
