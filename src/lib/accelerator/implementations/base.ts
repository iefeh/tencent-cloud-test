import {IRewardAccelerator} from "@/lib/models/RewardAccelerator";

// 奖励加速器
export abstract class Accelerator<T> {
    accelerator: IRewardAccelerator;

    protected constructor(accelerator: IRewardAccelerator) {
        this.accelerator = accelerator;
    }

    // 加速奖励
    abstract accelerate<U extends T>(reward: U): Promise<U>;
}