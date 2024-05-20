import { queryPrizePoolInfoAPI, queryPrizePoolListAPI } from '@/http/services/lottery';
import { useUserContext } from '@/store/User';
import { Lottery } from '@/types/lottery';
import { useEffect, useState } from 'react';

export default function usePrizePool() {
  const { userInfo } = useUserContext();
  const [poolIds, setPoolIds] = useState<string[]>([]);
  const [poolInfo, setPoolInfo] = useState<Lottery.Pool | null>(null);

  async function queryPools() {
    const res = await queryPrizePoolListAPI();
    setPoolIds(res?.lottery_pool_ids || []);
  }

  async function queryPoolInfo() {
    const id = poolIds[0];
    if (!id) return;

    const res = await queryPrizePoolInfoAPI({ lottery_pool_id: id });
    setPoolInfo(res || null);
  }

  function initData() {
    setPoolIds([]);
    setPoolInfo(null);
  }

  useEffect(() => {
    if (userInfo) {
      queryPools();
    } else {
      initData();
    }
  }, [userInfo]);

  useEffect(() => {
    if (poolIds.length < 1) return;

    queryPoolInfo();
  }, [poolIds]);

  return { poolInfo };
}
