import { LotteryRewardType } from '@/lib/lottery/types';
import LotteryPool, { ILotteryPool, ILotteryRewardItem } from '@/lib/models/LotteryPool';
import UserBadges from '@/lib/models/UserBadges';
import UserLotteryDrawHistory, {
    IUserLotteryRewardItem
} from '@/lib/models/UserLotteryDrawHistory';

import { LotteryRewardBase } from './base';

export class BadgeReward extends LotteryRewardBase {
  constructor(lotteryPoolId: string, reward: ILotteryRewardItem) {
    super(lotteryPoolId, reward);
  }

  async checkRewardDrawable(userId: string, drawResults?: IUserLotteryRewardItem[]): Promise<boolean> {
    const userBadge = await UserBadges.findOne({ user_id: userId, badge_id: this.reward.badge_id });
    const userDrawHistory = await UserLotteryDrawHistory.findOne({ user_id: userId, "rewards.badge_id": this.reward.badge_id });
    if (userBadge || userDrawHistory) {
      return false;
    }
    if (drawResults) {
      for (let drawResult of drawResults) {
        if (drawResult.reward_type === LotteryRewardType.Badge && drawResult.badge_id === this.reward.badge_id) {
          return false;
        }
      }
    }
    return true;
  }
}