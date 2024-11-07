import { LotteryRewardType } from '@/lib/lottery/types';
import LotteryPool, { ILotteryPool, ILotteryRewardItem } from '@/lib/models/LotteryPool';
import UserLotteryDrawHistory, {
    IUserLotteryRewardItem
} from '@/lib/models/UserLotteryDrawHistory';

import { LotteryRewardBase } from './base';

export class CDKReward extends LotteryRewardBase {
  constructor(lotteryPoolId: string, reward: ILotteryRewardItem) {
    super(lotteryPoolId, reward);
  }

  async checkRewardDrawable(userId: string, drawResults?: IUserLotteryRewardItem[]): Promise<boolean> {
    const userDrawHistory = await UserLotteryDrawHistory.findOne({ user_id: userId, "rewards.item_id": this.reward.item_id });
    if (userDrawHistory) {
      return false
    }
    if (drawResults) {
      for (let drawResult of drawResults) {
        if (drawResult.reward_type === LotteryRewardType.CDK && drawResult.item_id === this.reward.item_id) {
          return false
        }
      }
    }
    return true;
  }
}