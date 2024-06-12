import { Accelerator } from "@/lib/accelerator/implementations/base";
import { IRewardAccelerator } from "@/lib/models/RewardAccelerator";
import { BadgeHolderAcceleratorProperties, BadgeHolderReward, NFTHolderAcceleratorProperties, NftHolderReward } from "@/lib/accelerator/types";
import ContractNFT from "@/lib/models/ContractNFT";

// 徽章持有者加速器，用户持有对应徽章后，可以获得额外的MB奖励
export class BadgeHolderAccelerator extends Accelerator<BadgeHolderReward> {
    constructor(accelerator: IRewardAccelerator) {
        super(accelerator);
    }

    // 加速奖励， 通过用户持有的徽章，计算奖励加成
    async accelerate<U extends BadgeHolderReward>(reward: U): Promise<U> {
        if (reward.base_moon_beam <= 0) {
            return reward;
        }
        const props = this.accelerator.properties as BadgeHolderAcceleratorProperties;

        // 计算奖励加成
        if (props.support_stacking) {
            //若配置为允许奖励叠加，则把所有等级的奖励加和在一起
            let rewardBonus: number = 0;
            for (let s of props.series) {
                //用户达成奖励条件
                if (s.lv >= reward.lv) {
                    rewardBonus += s.reward_bonus
                }
            }
            //保存额外奖励
            reward.bonus_moon_beam = Math.ceil(reward.base_moon_beam * rewardBonus);
        } else {
            for (let s of props.series) {
                //用户达成奖励条件
                if (Number(s.lv) == Number(reward.lv)) {
                    reward.bonus_moon_beam = Math.ceil(reward.base_moon_beam * s.reward_bonus);
                    break;
                }
            }
        }
        return reward;
    }
}
