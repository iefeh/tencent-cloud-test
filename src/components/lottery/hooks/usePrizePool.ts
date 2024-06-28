import { queryPrizePoolInfoAPI, queryPrizePoolListAPI } from '@/http/services/lottery';
import { useUserContext } from '@/store/User';
import { Lottery } from '@/types/lottery';
import { useDisclosure } from '@nextui-org/react';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';

export default function usePrizePool() {
  const router = useRouter();
  const { userInfo } = useUserContext();
  const [poolIds, setPoolIds] = useState<string[]>([]);
  const [poolInfo, setPoolInfo] = useState<Lottery.Pool | null>(null);
  const queryPromise = useRef<Promise<{ lottery_pool_ids: string[] | null }> | null>(null);
  const endedDisclosure = useDisclosure();

  async function queryPools() {
    const { id } = router.query;
    if (id) {
      setPoolIds([id as string]);
      return;
    }

    if (queryPromise.current) return;
    queryPromise.current = queryPrizePoolListAPI();

    const res = await queryPromise.current;
    queryPromise.current = null;
    const ids = res?.lottery_pool_ids || [];
    if (ids.length < 1) endedDisclosure.onOpen();
    setPoolIds(ids);
  }

  async function queryPoolInfo() {
    const id = poolIds[0];
    if (!id) {
      endedDisclosure.onOpen();
      return;
    }

    const res = await queryPrizePoolInfoAPI({ lottery_pool_id: id });
    if (!res || typeof res === 'string') {
      endedDisclosure.onOpen();
      setPoolInfo(null);
    } else {
      setPoolInfo(res || null);
    }
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

  return { poolInfo, queryPoolInfo, endedDisclosure };
}
