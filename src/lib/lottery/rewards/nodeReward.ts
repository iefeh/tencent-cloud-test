import { LotteryRewardType } from '@/lib/lottery/types';
import LotteryPool, { ILotteryPool, ILotteryRewardItem } from '@/lib/models/LotteryPool';
import UserLotteryDrawHistory, {
    IUserLotteryRewardItem
} from '@/lib/models/UserLotteryDrawHistory';

import { LotteryRewardBase } from './base';

export class NodeReward extends LotteryRewardBase {
  constructor(lotteryPoolId: string, reward: ILotteryRewardItem) {
    super(lotteryPoolId, reward);
  }

  async checkRewardDrawable(userId: string, drawResults?: IUserLotteryRewardItem[]): Promise<boolean> {
    const userDrawHistory = await UserLotteryDrawHistory.findOne({ user_id: userId, lottery_pool_id: this.lotteryPoolId, "rewards.reward_type": LotteryRewardType.Node });
    if (userDrawHistory) {
      return false;
    }
    if (drawResults) {
      for (let drawResult of drawResults) {
        if (drawResult.reward_type === LotteryRewardType.Node) {
          return false;
        }
      }
    }
    return true;
  }
}