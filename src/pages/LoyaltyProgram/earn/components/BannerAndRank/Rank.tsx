import { useEffect, useState } from 'react';
import bgImg from 'img/loyalty/earn/bg_rank.jpg';
import Image from 'next/image';
import leftDecoImg from 'img/loyalty/earn/leaderbord_deco_left.png';
import rightDecoImg from 'img/loyalty/earn/leaderbord_deco_right.png';
import { cn } from '@nextui-org/react';
import MyRanking from '@/pages/components/common/MyRanking';
import { LeaderBoardItem, leaderBoardRankAPI } from '@/http/services/task';
import CircularLoading from '@/pages/components/common/CircularLoading';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';

export default function Rank() {
  const [topRanks, setTopRanks] = useState<LeaderBoardItem[]>([]);
  const [myRankInfo, setMyRankInfo] = useState<LeaderBoardItem | null>();
  const [rankList, setRankList] = useState<LeaderBoardItem[]>([]);
  const [loading, setLoading] = useState(false);

  async function queryRank() {
    setLoading(true);

    try {
      const res = await leaderBoardRankAPI();
      const { leaderboard, me } = res;

      // slidesPerView设置为2，因此长度小于4时，可能无法持续滚动
      const minLen = me ? 2 : 3;
      setRankList(
        leaderboard.length < minLen ** 2
          ? Array(minLen)
              .fill(null)
              .map(() => leaderboard)
              .flat()
          : leaderboard,
      );
      setMyRankInfo(me);
      setTopRanks(leaderboard.slice(0, 3));
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
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
                index === 0 && 'translate-x-3',
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
        {myRankInfo && (
          <MyRanking className="rounded-t-[2.25rem]" rank={myRankInfo.rank} points={myRankInfo.moon_beam} />
        )}

        <div
          className={cn([
            'w-full h-[10.25rem] flex-1 relative z-0 overflow-hidden block px-[1.375rem]  bg-black border-1 border-[#251B11]',
            myRankInfo || 'rounded-t-[2.25rem]',
          ])}
        >
          {/* 有数据后立即初始化，否则将提前滚动 */}
          {rankList.length > 0 && (
            <Swiper
              className="w-full h-full overflow-hidden rounded-[0.625rem] relative"
              wrapperClass="!ease-linear"
              modules={[Autoplay]}
              loop
              slidesPerView={myRankInfo ? 2 : 3}
              direction="vertical"
              freeMode
              autoplay={{ delay: 0, disableOnInteraction: false }}
              speed={2000}
            >
              {rankList.map((rank, index) => (
                <SwiperSlide key={index} className="relative cursor-pointer">
                  <div
                    key={index}
                    className="flex items-center h-[5.0625rem] font-poppins-medium text-basic-yellow text-base border-b-1 border-[rgba(246,199,153,0.1)]"
                  >
                    <span className="w-[2.625rem]">{rank.rank}</span>

                    <Image
                      className="border-1 border-basic-yellow rounded-full"
                      src={rank.avatar_url}
                      alt=""
                      width={48}
                      height={48}
                    />

                    <span className="flex-1 ml-[0.875rem] text-ellipsis overflow-hidden whitespace-nowrap">
                      {rank.username}
                    </span>

                    <span className="ml-[1.5rem]">{rank.moon_beam}</span>
                  </div>
                </SwiperSlide>
              ))}

              <div
                className="basic-swiper-pagination text-white z-10 font-decima flex"
                style={{ left: '3.375rem', bottom: '2.1675rem' }}
              ></div>
            </Swiper>
          )}
        </div>
      </div>

      {loading && <CircularLoading />}
    </div>
  );
}
