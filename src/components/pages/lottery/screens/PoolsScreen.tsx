import Link from 'next/link';
import { FC } from 'react';
import CircularLoading from '@/pages/components/common/CircularLoading';
import PoolCard from '../PoolCard';
import usePageQuery from '@/hooks/usePageQuery';
import { queryPoolsListAPI } from '@/http/services/lottery';
// import { LotteryStatus } from '@/constant/lottery';

const PoolsScreen: FC = () => {
  const { loading, data: pools } = usePageQuery({
    key: 'lottery_pools',
    pageSize: 3,
    fn: queryPoolsListAPI,
    notFill: true,
    // paramsFn: (pagi) => ({ ...pagi, open_status: LotteryStatus.IN_PROGRESS }),
  });

  return (
    <section className="max-w-[87.5rem] mx-auto relative z-0">
      <div className="flex justify-between items-center text-basic-yellow">
        <div className="font-semakin text-2xl leading-none">More and $MORE Lottery Pools</div>

        <Link href="/lottery/list" target="_self" className="text-base leading-none hover:underline">
          More &gt;&gt;
        </Link>
      </div>

      <div className="w-full h-0 border-t-1 border-basic-gray mt-5"></div>

      <div className="relative min-h-[12.5rem] grid grid-cols-3 gap-6 mt-10">
        {pools.map((pool, index) => (
          <PoolCard key={index} item={pool} />
        ))}

        {loading && <CircularLoading />}
      </div>
    </section>
  );
};

export default PoolsScreen;
