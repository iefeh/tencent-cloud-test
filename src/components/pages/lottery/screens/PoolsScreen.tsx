import Link from 'next/link';
import { FC } from 'react';
import usePools from '../hooks/usePools';
import CircularLoading from '@/pages/components/common/CircularLoading';
import PoolCard from '../PoolCard';

const PoolsScreen: FC = () => {
  const { loading, pools } = usePools();

  return (
    <section className="max-w-[87.5rem] mx-auto relative z-0">
      <div className="flex justify-between items-center text-basic-yellow">
        <div className="font-semakin text-2xl leading-none">More and $MORE Lottery Pools</div>

        <Link href="/lottery/list" className="text-base leading-none hover:underline">
          More &gt;&gt;
        </Link>
      </div>

      <div className='w-full h-0 border-t-1 border-basic-gray mt-5'></div>

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
