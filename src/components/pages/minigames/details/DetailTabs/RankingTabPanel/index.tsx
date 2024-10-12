import EmptyContent from '@/components/common/EmptyContent';
import { queryMiniGameLeaderboardAPI } from '@/http/services/minigames';
import CircularLoading from '@/pages/components/common/CircularLoading';
import { useMGDContext } from '@/store/MiniGameDetails';
import { MiniGames } from '@/types/minigames';
import { cn } from '@nextui-org/react';
import { observer } from 'mobx-react-lite';
import { useState, type CSSProperties, type FC, useEffect } from 'react';
import { isMobile } from 'react-device-detect';
import RankingTable from './RankingTable';

const RankingTabPanel: FC = () => {
  const { data } = useMGDContext();
  const [ranking, setRanking] = useState<MiniGames.GameDetialLeaderboard | null>(null);
  const [loading, setLoading] = useState(false);
  const { latest, previous } = ranking || {};
  const varStyles = { '--stroke-color': '#7A0A08' } as CSSProperties;

  async function queryLeaderboard() {
    if (!data?.client_id) {
      setRanking(null);
      return;
    }

    setLoading(true);
    const res = await queryMiniGameLeaderboardAPI({ client_id: data.client_id });
    setRanking(res?.leaderboard || null);
    setLoading(false);
  }

  useEffect(() => {
    queryLeaderboard();
  }, [data]);

  return (
    <div
      className={cn([
        'relative rounded-[1.25rem] w-full flex flex-col md:flex-row no-wrap gap-6 min-h-[15rem] mt-14',
        !isMobile && !ranking && 'h-[36rem]',
      ])}
      style={varStyles}
    >
      {loading ? (
        <CircularLoading />
      ) : !ranking ? (
        <EmptyContent className="!z-10" />
      ) : (
        <>
          <RankingTable ranking={latest} />

          <RankingTable ranking={previous} />
        </>
      )}
    </div>
  );
};

export default observer(RankingTabPanel);
