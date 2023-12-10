import Image from 'next/image';
import { useState } from 'react';
import myRankBgImg from 'img/loyalty/earn/bg_my_rank.jpg';
import blackRankImg from 'img/loyalty/earn/rank_black.png';
import blackMBImg from 'img/loyalty/earn/mb_black.png';
import { cn } from '@nextui-org/react';

interface Props {
  className?: string;
}

export default function MyRanking(props: Props) {
  const { className } = props;
  const [myRankInfo, setMyRankInfo] = useState({ rank: 68, points: 2546 });

  return (
    <div className={cn(['w-full h-[4.53125rem] relative overflow-hidden', className])}>
      <Image src={myRankBgImg} alt="" fill />

      <div className="w-full h-full relative z-0 flex justify-between items-center text-black font-semakin px-6">
        <div className="flex items-center">
          <Image className="w-[2.625rem] h-[2.625rem] overflow-hidden rounded-full" src={blackMBImg} alt="" />

          <div className="h-full flex flex-col justify-between ml-[0.625rem]">
            <span className="text-2xl leading-none">{myRankInfo.points || '--'}</span>
            <span className="leading-none">Moon Beams</span>
          </div>
        </div>

        <div className="flex items-center">
          <Image className="w-[2.625rem] h-[2.625rem] overflow-hidden rounded-full" src={blackRankImg} alt="" />

          <div className="h-full flex flex-col justify-between ml-[0.625rem]">
            <span className="text-2xl leading-none">{myRankInfo.rank || '--'}</span>
            <span className="leading-none">Ranking</span>
          </div>
        </div>
      </div>
    </div>
  );
}
