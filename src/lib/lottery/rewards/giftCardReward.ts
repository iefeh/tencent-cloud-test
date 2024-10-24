import { LotteryRewardBase } from "./base";
import LotteryPool, { ILotteryPool, ILotteryRewardItem } from '@/lib/models/LotteryPool';
import UserLotteryDrawHistory, { IUserLotteryRewardItem } from '@/lib/models/UserLotteryDrawHistory';

export class GiftCardReward extends LotteryRewardBase {
  constructor(lotteryPoolId: string, reward: ILotteryRewardItem) {
    super(lotteryPoolId, reward);
  }

  async checkRewardDrawable(userId: string, drawResults?: IUserLotteryRewardItem[]): Promise<boolean> {
    return true;
  }
}