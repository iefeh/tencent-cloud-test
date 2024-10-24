import LotteryPool, { ILotteryPool, ILotteryRewardItem } from '@/lib/models/LotteryPool';
import UserLotteryDrawHistory, { IUserLotteryRewardItem } from '@/lib/models/UserLotteryDrawHistory';

export abstract class LotteryRewardBase {
  reward: ILotteryRewardItem;
  lotteryPoolId: string;

  protected constructor(lotteryPoolId: string, reward: ILotteryRewardItem) {
    this.reward = reward;
    this.lotteryPoolId = lotteryPoolId;
  }

  abstract checkRewardDrawable(userId: string, drawResults?: IUserLotteryRewardItem[]): Promise<boolean>;
}