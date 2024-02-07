import {Accelerator} from "@/lib/accelerator/implementations/base";
import {IRewardAccelerator} from "@/lib/models/RewardAccelerator";
import {NFTHolderAcceleratorProperties} from "@/lib/accelerator/types";
import ContractNFT from "@/lib/models/ContractNFT";

type NftHolderReward = {
    // 用户钱包地址
    wallet_address: string,
    // 奖励的mb数量
    moon_beam: number,
}

// NFT持有者加速器，用户持有NFT后，可以获得额外的MB奖励
export class NftHolderAccelerator extends Accelerator<NftHolderReward> {
    constructor(accelerator: IRewardAccelerator) {
        super(accelerator);
    }

    async accelerate<U extends NftHolderReward>(reward: U): Promise<U> {
        const props = this.accelerator.properties as NFTHolderAcceleratorProperties;
        const filter: any = {
            chain_id: props.chain_id,
            contract_address: props.contract_address,
            wallet_addr: reward.wallet_address,
        }
        if (props.min_hold_duration) {
            filter.created_time = {
                $gte: new Date(Date.now() - props.min_hold_duration * 1000),
            }
        }
        // 获取用户持有的NFT数量
        const nfts = await ContractNFT.find(filter, {_id: 0, token_id: 1});
        const nftCount = nfts.length;
        // 计算奖励加成
        if (props.support_stacking) {
            reward.moon_beam = Math.ceil(reward.moon_beam * props.reward_bonus * nftCount);
        } else {
            reward.moon_beam = Math.ceil(reward.moon_beam * props.reward_bonus);
        }
        return reward;
    }
}
