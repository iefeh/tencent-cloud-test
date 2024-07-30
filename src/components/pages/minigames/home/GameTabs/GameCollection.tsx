import EmptyContent from '@/components/common/EmptyContent';
import usePageQuery from '@/hooks/usePageQuery';
import { queryMiniGamesAPI } from '@/http/services/minigames';
import CircularLoading from '@/pages/components/common/CircularLoading';
import { FC, useEffect } from 'react';
import GameCard from './GameCard';
import MiniCirclePagination from '@/components/common/CirclePagination/mini';

interface Props {
  type: string;
}

const PAGE_SIZE = 9;

const GameCollection: FC<Props> = ({ type }) => {
  const { data, total, loading, queryData, setData, onPageChange } = usePageQuery({
    key: 'quests',
    fn: queryMiniGamesAPI,
    pageSize: PAGE_SIZE,
    notFill: true,
    paramsFn: ({ page_num, page_size }) => {
      const data: any = {
        page_num: page_num,
        page_size: page_size,
        status: type,
      };

      if (type === 'all') delete data.status;
      if (type === 'tickets_available') data.ticket_available = 1;

      return data;
    },
  });

  useEffect(() => {
    if (type) {
      queryData(true);
    } else {
      setData([]);
    }
  }, [type]);

  return (
    <div className="w-[87.5rem] relative flex flex-col items-center min-h-[15rem]">
      {data.length > 0 ? (
        <>
          <div className="grid grid-cols-3 gap-x-6 gap-y-7 w-full">
            {data.map((item, index) => (
              <GameCard key={index} item={item} />
            ))}
          </div>

          <MiniCirclePagination
            className="mt-[4.875rem]"
            total={Math.ceil(total / PAGE_SIZE)}
            onChange={(index) => onPageChange({ page_num: index })}
          />
        </>
      ) : (
        <EmptyContent className="!relative backdrop-blur-none !backdrop-saturate-100 bg-transparent text-white" />
      )}

      {loading && <CircularLoading />}
    </div>
  );
};

export default GameCollection;
