import { BadgeReward } from '@/lib/lottery/rewards/badgeReward';
import { LotteryRewardBase } from '@/lib/lottery/rewards/base';
import { CDKReward } from '@/lib/lottery/rewards/cdkReward';
import { GiftCardReward } from '@/lib/lottery/rewards/giftCardReward';
import { LotteryTicketReward } from '@/lib/lottery/rewards/lotteryTicketReward';
import { MoonbeamReward } from '@/lib/lottery/rewards/moonbeamReward';
import { NFTReward } from '@/lib/lottery/rewards/nftReward';
import { NodeReward } from '@/lib/lottery/rewards/nodeReward';
import { USDTReward } from '@/lib/lottery/rewards/usdtReward';
import { LotteryRewardType } from '@/lib/lottery/types';
import { ILotteryRewardItem } from '@/lib/models/LotteryPool';

// 根据reward type构造对应的reward实例
export function constructLotteryReward(lotteryPoolId: string, reward: ILotteryRewardItem): LotteryRewardBase {
  switch (reward.reward_type) {
    case LotteryRewardType.Badge:
      return new BadgeReward(lotteryPoolId, reward);
    case LotteryRewardType.CDK:
      return new CDKReward(lotteryPoolId, reward);
    case LotteryRewardType.Node:
      return new NodeReward(lotteryPoolId, reward);
    case LotteryRewardType.GiftCard:
      return new GiftCardReward(lotteryPoolId, reward);
    case LotteryRewardType.LotteryTicket:
      return new LotteryTicketReward(lotteryPoolId, reward);
    case LotteryRewardType.MoonBeam:
      return new MoonbeamReward(lotteryPoolId, reward);
    case LotteryRewardType.NFT:
      return new NFTReward(lotteryPoolId, reward);
    case LotteryRewardType.Node:
      return new NodeReward(lotteryPoolId, reward);
    case LotteryRewardType.USDT:
      return new USDTReward(lotteryPoolId, reward);
    default:
      throw new Error(`reward ${reward.item_id} type ${reward.reward_type} not implemented`);
  }
}
