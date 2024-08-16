import { queryPoolsListAPI } from '@/http/services/lottery';
import type { Lottery } from '@/types/lottery';
import { useEffect, useState } from 'react';
import testPools from './testPools.json';

export default function usePools() {
  const [loading, setLoading] = useState<boolean>(false);
  const [pools, setPools] = useState<Lottery.Pool[]>([]);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState<PageQueryDto>({ page_num: 1, page_size: 1 });

  async function queryPool(options: Partial<PageQueryDto & { status?: string }> = {}) {
    setLoading(true);
    const { status, ...pagi } = Object.assign({}, pagination, options);
    const res = await queryPoolsListAPI({ status, ...pagi });
    setPools(testPools as Lottery.Pool[]);
    setTotal(+(res.total || 0));
    setPagination(pagi);
    setLoading(false);
  }

  useEffect(() => {
    queryPool();
  }, []);

  return {
    pagination,
    total,
    // totalPages: Math.ceil((total || 0) / pagination.page_size),
    totalPages: 3,
    loading,
    pools,
    queryPool,
  };
}
