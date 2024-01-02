import { useEffect, useState } from 'react';
import bgImg from 'img/loyalty/earn/bg_rank.jpg';
import Image from 'next/image';
import leftDecoImg from 'img/loyalty/earn/leaderbord_deco_left.png';
import rightDecoImg from 'img/loyalty/earn/leaderbord_deco_right.png';
import { cn } from '@nextui-org/react';
import MyRanking from '@/pages/components/common/MyRanking';
import { LeaderBoardItem, leaderBoardRankAPI } from '@/http/services/task';

export default function Rank() {
  const [topRanks, setTopRanks] = useState<LeaderBoardItem[]>([]);
  const [myRankInfo, setMyRankInfo] = useState<LeaderBoardItem | null>();
  const [rankList, setRankList] = useState<LeaderBoardItem[]>([]);

  async function queryRank() {
    const res = await leaderBoardRankAPI();
    const { leaderboard, me } = res;
    setRankList(leaderboard);
    setMyRankInfo(me);
    setTopRanks(leaderboard.slice(0, 3));
  }

  useEffect(() => {
    queryRank();
  }, []);

  return (
    <div className="w-[28.125rem] h-[37.5rem] overflow-hidden rounded-[0.625rem] relative flex flex-col items-center pt-[1.9375rem]">
      <Image src={bgImg} alt="" fill />

      {/* Title */}
      <div className="flex justify-center items-center gap-[0.5625rem] relative">
        <Image className="w-[4.5625rem] h-[0.125rem]" src={leftDecoImg} alt="" />
        <span className="uppercase font-semakin text-basic-yellow text-2xl">Leaderboard</span>
        <Image className="w-[4.5625rem] h-[0.125rem]" src={rightDecoImg} alt="" />
      </div>

      {/* Top */}
      <div className="flex justify-between items-end relative h-[17.75rem] gap-10">
        {topRanks.map((rank, index) => {
          return (
            <div
              key={index}
              className={cn([
                'flex flex-col items-center',
                index === 0 && 'order-2',
                index === 1 && 'order-1',
                index > 1 && 'order-3',
              ])}
            >
              <div className="relative">
                <Image className="w-[3.75rem] h-[3.75rem]" src={rank.avatar_url} alt="" width={60} height={60} />

                <Image
                  className="w-7 h-[1.6875rem] absolute -top-[0.8125rem] -left-[0.8125rem]"
                  src={`/img/loyalty/earn/crown_${index + 1}.png`}
                  alt=""
                  width={28}
                  height={29}
                />
              </div>
              <div className="font-poppins-medium text-base">{rank.username}</div>
              <div className="font-semakin text-base text-basic-yellow">{rank.moon_beam}</div>
              <div
                className={cn([
                  'rank relative font-semakin text-basic-yellow text-center',
                  index === 0 && 'w-[6.75rem] h-[5.8125rem] text-4xl pt-11 mt-[2.3125rem]',
                  index !== 0 && 'w-[4.0625rem] h-[3.5rem] text-2xl pt-6 mt-3',
                ])}
              >
                {index === 0 ? (
                  <Image src="/img/loyalty/earn/bg_rank_champion.png" alt="" fill />
                ) : (
                  <Image src="/img/loyalty/earn/bg_rank_not_champion.png" alt="" fill />
                )}
                <span className={cn(['relative z-0', index === 0 && '-left-1'])}>{index + 1}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col w-[25.625rem] h-[14.6875rem] overflow-hidden">
        {/* My Rank */}
        {myRankInfo && <MyRanking className="rounded-t-[2.25rem]" />}

        <div
          className={cn([
            'w-full h-[10.25rem] flex-1 relative z-0 overflow-hidden block px-[1.375rem]  bg-black border-1 border-[#251B11]',
            myRankInfo || 'rounded-t-[2.25rem]',
          ])}
        >
          <div className="animate-[scrollUp_30s_linear_infinite]">
            {rankList.map((rank, index) => {
              return (
                <div
                  key={index}
                  className="flex items-center h-[5.0625rem] font-poppins-medium text-basic-yellow text-base border-b-1 border-[rgba(246,199,153,0.1)]"
                >
                  <span className="w-[2.625rem]">{rank.rank}</span>

                  <Image className="border-1 border-basic-yellow rounded-full" src={rank.avatar_url} alt="" width={48} height={48} />

                  <span className="flex-1 ml-[0.875rem] text-ellipsis overflow-hidden whitespace-nowrap">
                    {rank.username}
                  </span>

                  <span className="ml-[1.5rem]">{rank.moon_beam}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
