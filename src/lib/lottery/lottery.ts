import LotteryPool, {ILotteryPool} from '@/lib/models/LotteryPool';
import UserLotteryPool from '@/lib/models/UserLotteryPool';
import { isPremiumSatisfied } from '@/lib/battlepass/battlepass';

export async function getLotteryPoolById(lotteryPoolId: string): Promise<ILotteryPool | null> {
  const lotteryPool = await LotteryPool.findOne({ lottery_pool_id: lotteryPoolId, deleted_time: null });
  const now = Date.now();
  if (!lotteryPool || lotteryPool.start_time > now || lotteryPool.end_time <= now) {
    return null;
  }
  return lotteryPool;
}

export async function canClaimPremiumBenifits(userId: string, lotteryPoolId: string): Promise<boolean> {
  const isPremium = await isPremiumSatisfied(userId); 
  const userLotteryPool = await UserLotteryPool.findOne({ user_id: userId, lottery_pool_id: lotteryPoolId, deleted_time: null });
  return isPremium && (!userLotteryPool || !userLotteryPool.premium_benifits_claimed);
}