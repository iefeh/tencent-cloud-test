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

const GameCollection: FC<Props> = ({ type }) => {
  const { data, total, loading, queryData, setData, onPageChange } = usePageQuery({
    key: 'quests',
    fn: queryMiniGamesAPI,
    notFill: true,
    paramsFn: ({ page_num, page_size }) => {
      return {
        page_num: page_num,
        page_size: page_size,
        status: type,
        ticket_available: 1,
      };
    },
  });

  useEffect(() => {
    if (type) {
      queryData();
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
            total={total}
            onChange={(index) => onPageChange({ page_num: index })}
          />
        </>
      ) : (
        <EmptyContent className="!relative backdrop-blur-none backdrop-saturate-100 bg-transparent" />
      )}

      {loading && <CircularLoading />}
    </div>
  );
};

export default GameCollection;
