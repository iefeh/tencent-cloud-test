import EmptyContent from '@/components/common/EmptyContent';
import { queryMiniGameLeaderboardAPI } from '@/http/services/minigames';
import CircularLoading from '@/pages/components/common/CircularLoading';
import { useMGDContext } from '@/store/MiniGameDetails';
import { MiniGames } from '@/types/minigames';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  cn,
} from '@nextui-org/react';
import { observer } from 'mobx-react-lite';
import Image from 'next/image';
import { useState, type CSSProperties, type FC, useEffect } from 'react';

const RankingTabPanel: FC = () => {
  const { data } = useMGDContext();
  const [ranking, setRanking] = useState<MiniGames.GameDetialLeaderboard | null>(null);
  const [loading, setLoading] = useState(false);
  const { leaderboard, user_rank } = ranking || {};
  const columns = ['Rank', 'Player', 'Score'];
  const varStyles = { '--stroke-color': '#7A0A08' } as CSSProperties;

  async function queryLeaderboard() {
    if (!data?.client_id) {
      setRanking(null);
      return;
    }

    setLoading(true);
    const res = await queryMiniGameLeaderboardAPI({ client_id: data.client_id });
    setRanking(res?.ranking || null);
    setLoading(false);
  }

  useEffect(() => {
    queryLeaderboard();
  }, [data]);

  return (
    <div className="pt-6 px-[1.875rem] pb-9 rounded-[1.25rem] bg-[#F7E9CC] relative" style={varStyles}>
      {loading ? (
        <CircularLoading />
      ) : !ranking ? (
        <EmptyContent />
      ) : (
        <Table
          aria-label="Events participated"
          classNames={{
            table: 'border-collapse',
            wrapper: 'bg-transparent shadow-none p-0 rounded-none',
            thead: '[&>tr:nth-child(2)]:hidden rounded-tl-[1.25rem]',
            tbody: 'pl-[2.1875rem] pr-[1.1875rem] ',
            tr: 'relative',
            th: 'bg-transparent text-white text-xl leading-none outline-none p-0 h-auto',
            td: '',
          }}
        >
          <TableHeader>
            {columns.map((column, index) => (
              <TableColumn key={index} className={cn([index === 0 && 'w-[9.625rem]', index === 1 && 'w-80'])}>
                <div
                  className={cn([
                    'border-y-3 border-[#CAB790] bg-[#472E24] h-12 leading-[2.625rem] pl-6',
                    index === 0 && 'border-l-3 rounded-tl-[1.25rem] rounded-bl-base',
                    index === columns.length - 1 && 'border-r-3 rounded-tr-[1.25rem] rounded-br-base',
                  ])}
                >
                  {column}
                </div>
              </TableColumn>
            ))}
          </TableHeader>
          <TableBody emptyContent={'No history found.'}>
            {(leaderboard || []).map((row, index) => (
              <TableRow key={index} className="[&:nth-child(2n+1)]:bg-[#E4D4B2] h-[4.125rem]">
                <TableCell className="rounded-l-base pl-5">
                  <Image
                    className="object-contain w-[2.0625rem] h-[2.0625rem]"
                    src={`https://moonveil-public.s3.ap-southeast-2.amazonaws.com/minigames/icons/icon_${row.rank}.png`}
                    alt=""
                    width={66}
                    height={66}
                    unoptimized
                    priority
                  />
                </TableCell>

                <TableCell className="pl-5">
                  <Popover placement="bottom" showArrow={true}>
                    <PopoverTrigger>
                      <div className="flex items-center">
                        <div className="w-12 h-12 relative rounded-full overflow-hidden bg-[#8F5535] border-1 border-brown">
                          <Image
                            className="object-contain"
                            src={
                              row.avatar || 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/avatar/default.png'
                            }
                            alt=""
                            fill
                            sizes="100%"
                            unoptimized
                            priority
                          />
                        </div>
                        <span className="text-lg leading-none ml-[1.125rem] text-brown lg:max-w-[15.5rem] md:max-w-[11rem] max-w-[4rem] overflow-hidden text-ellipsis whitespace-nowrap">
                          {row.player || '-'}
                        </span>
                      </div>
                    </PopoverTrigger>

                    <PopoverContent>{row.player || '-'}</PopoverContent>
                  </Popover>
                </TableCell>

                <TableCell className="rounded-r-base pl-5 text-yellow-1 text-2xl">
                  <div className="stroke-text-normal" data-text={row.score || '-'}></div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <div className="flex items-center bg-[#E4D4B2] rounded-base border-1 border-dashed border-[#8F5535] h-20 mt-3 pl-6">
        <span className="text-brown text-2xl">My Rank</span>

        <Image
          className="object-contain w-[3.125rem] h-[3.125rem] ml-11"
          src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/minigames/icons/icon_star.png"
          alt=""
          width={100}
          height={100}
          unoptimized
          priority
        />

        <span className="ml-[0.875rem] stroke-text-normal text-3xl text-[#FDC511]" data-text={user_rank || '-'}></span>
      </div>
    </div>
  );
};

export default observer(RankingTabPanel);
