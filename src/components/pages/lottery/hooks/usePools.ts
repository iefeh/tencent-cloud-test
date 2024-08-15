import { queryPoolsListAPI } from '@/http/services/lottery';
import type { Lottery } from '@/types/lottery';
import { useEffect, useState } from 'react';
import testPools from './testPools.json';

export default function usePools() {
  const [loading, setLoading] = useState<boolean>(false);
  const [pools, setPools] = useState<Lottery.Pool[]>([]);

  async function queryPool() {
    setLoading(true);
    const res = await queryPoolsListAPI();
    setPools(testPools as Lottery.Pool[]);
    setLoading(false);
  }

  useEffect(() => {
    queryPool();
  }, []);

  return { loading, pools, queryPool };
}
