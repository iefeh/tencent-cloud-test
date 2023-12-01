import { useState } from 'react';
import bgImg from 'img/loyalty/earn/bg_rank.jpg';
import Image from 'next/image';
import leftDecoImg from 'img/loyalty/earn/leaderbord_deco_left.png';
import rightDecoImg from 'img/loyalty/earn/leaderbord_deco_right.png';

export default function Rank() {
  const [topRanks, setTopRanks] = useState([
    {
      nickname: 'mason',
      points: 4665779,
    },
    {
      nickname: 'mj',
      points: 4665778,
    },
    {
      nickname: 'jw',
      points: 4665777,
    },
  ]);

  return (
    <div className="w-[28.125rem] h-[37.5rem] overflow-hidden rounded-[0.625rem] relative flex flex-col items-center pt-[1.9375rem]">
      <Image src={bgImg} alt="" fill />

      {/* Title */}
      <div className="flex justify-center items-center gap-[0.5625rem] relative">
        <Image className="w-[4.5625rem] h-[0.125rem]" src={leftDecoImg} alt="" />
        <span className="uppercase font-semakin text-basic-yellow text-2xl">Leaderboard</span>
        <Image className="w-[4.5625rem] h-[0.125rem]" src={rightDecoImg} alt="" />
      </div>

      {/* Rank */}
      <div className="flex justify-between items-end relative"></div>
    </div>
  );
}
