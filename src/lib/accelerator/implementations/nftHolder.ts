import {Accelerator} from "@/lib/accelerator/implementations/base";
import {IRewardAccelerator} from "@/lib/models/RewardAccelerator";
import {NFTHolderAcceleratorProperties, NftHolderReward} from "@/lib/accelerator/types";
import ContractNFT from "@/lib/models/ContractNFT";

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
        const props = this.accelerator.properties as NFTHolderAcceleratorProperties;
        const filter: any = {
            chain_id: props.chain_id,
            contract_address: props.contract_address,
            wallet_addr: reward.wallet_address,
        }
        if (props.min_hold_duration) {
            // 用户持有NFT的最小持有时间
            filter.created_time = {
                $lte: Date.now() - props.min_hold_duration * 1000,
            }
        }
        // 获取用户持有的NFT数量
        const nfts = await ContractNFT.find(filter, {_id: 0, token_id: 1});
        const nftCount = nfts.length;
        // 计算奖励加成
        if (props.support_stacking) {
            reward.bonus_moon_beam = Math.ceil(reward.base_moon_beam * props.reward_bonus * nftCount);
        } else {
            reward.bonus_moon_beam = Math.ceil(reward.base_moon_beam * props.reward_bonus);
        }
        return reward;
    }
}
