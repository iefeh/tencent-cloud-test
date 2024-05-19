import { queryPrizePoolInfoAPI, queryPrizePoolListAPI } from '@/http/services/lottery';
import { Lottery } from '@/types/lottery';
import { useDisclosure } from '@nextui-org/react';
import { useEffect, useState } from 'react';

export default function usePrizePool() {
  const disclosure = useDisclosure();
  const [poolIds, setPoolIds] = useState<string[]>([]);
  const [poolInfo, setPoolInfo] = useState<Lottery.Pool | null>(null);

  async function queryPools() {
    const res = await queryPrizePoolListAPI();
    setPoolIds(res.lottery_pool_ids || []);
  }

  async function queryPoolInfo() {
    const id = poolIds[0];
    if (!id) return;

    const res = await queryPrizePoolInfoAPI({ lottery_pool_id: id });
    setPoolInfo(res || null);
  }

  function onShowPrizePool() {
    disclosure.onOpen();
  }

  useEffect(() => {
    queryPools();
  }, []);

  useEffect(() => {
    if (poolIds.length < 1) return;

    queryPoolInfo();
  }, [poolIds]);

  return { disclosure, poolInfo, onShowPrizePool };
}
