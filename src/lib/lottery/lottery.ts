import LotteryPool, {ILotteryPool} from '@/lib/models/LotteryPool';

export async function getLotteryPoolById(lotteryPoolId: string): Promise<ILotteryPool | null> {
  const lotteryPool = await LotteryPool.findOne({ lottery_pool_id: lotteryPoolId, deleted_time: null });
  const now = Date.now();
  if (!lotteryPool || lotteryPool.start_time > now || lotteryPool.end_time <= now) {
    return null;
  }
  return lotteryPool;
}