import Link from 'next/link';
import { FC, useEffect } from 'react';
import CircularLoading from '@/pages/components/common/CircularLoading';
import PoolCard from '../PoolCard';
import usePageQuery from '@/hooks/usePageQuery';
import { queryPoolsListAPI } from '@/http/services/lottery';
import { useUserContext } from '@/store/User';
import { observer } from 'mobx-react-lite';
import LGButton from '@/pages/components/common/buttons/LGButton';
import EmptyContent from '@/components/common/EmptyContent';
import { cn } from '@nextui-org/react';
// import { LotteryStatus } from '@/constant/lottery';

const PoolsScreen: FC = () => {
  const { userInfo } = useUserContext();
  const {
    loading,
    data: pools,
    queryData,
  } = usePageQuery({
    key: 'lottery_pools',
    pageSize: 3,
    fn: queryPoolsListAPI,
    notFill: true,
    // paramsFn: (pagi) => ({ ...pagi, open_status: LotteryStatus.IN_PROGRESS }),
  });

  useEffect(() => {
    queryData();
  }, [userInfo]);

  return (
    <section className="max-w-[87.5rem] mx-auto relative z-0 px-8 md:px-0">
      <div className="flex justify-between items-center text-basic-yellow">
        <div className="font-semakin text-2xl leading-none">More and $MORE Draw Pools</div>

        <Link href="/lottery/list" target="_self" className="text-base leading-none whitespace-nowrap hover:underline">
          More &gt;&gt;
        </Link>
      </div>

      <div className="w-full h-0 border-t-1 border-basic-gray mt-5"></div>

      {userInfo ? (
        <div
          className={cn(['relative grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 min-h-[12.5rem]', pools.length < 1 && 'min-h-[36rem]'])}
        >
          {loading ? (
            <CircularLoading />
          ) : pools.length < 1 ? (
            <EmptyContent content="Coming soon, please stay tuned." />
          ) : (
            pools.map((pool, index) => <PoolCard key={index} item={pool} />)
          )}
        </div>
      ) : (
        <div className="w-full min-h-[12.5rem] flex flex-col justify-center items-center mt-10">
          <LGButton label="Please sign-in to continue" actived needAuth />
        </div>
      )}
    </section>
  );
};

export default observer(PoolsScreen);
