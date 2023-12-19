import PageDesc from '@/pages/components/common/PageDesc';
import ScrollDownArrow from '@/pages/components/common/ScrollDownArrow';
import Image from 'next/image';
import bgImg from 'img/loyalty/intro/bg_home.jpg';
import smallTriangleImg from 'img/loyalty/intro/triangle_small.png';
import bigTriangleImg from 'img/loyalty/intro/triangle_big.png';
import { useRef } from 'react';
import useShake from '@/hooks/useShake';

export default function IndexScreen() {
  const smallTriangleShakeRef = useRef<HTMLDivElement>(null);
  const bigTriangleShakeRef = useRef<HTMLDivElement>(null);

  useShake(smallTriangleShakeRef, { maxDegX: 30, maxDegY: 15 });
  useShake(bigTriangleShakeRef, { maxDegX: 30, maxDegY: 15 });

  return (
    <div className="w-full h-screen flex justify-center items-center relative">
      <Image className="object-cover" src={bgImg} alt="" fill />

      <div className="absolute top-[22.5%] left-[22.34%] z-10">
        <div
          className="relative"
          ref={smallTriangleShakeRef}
        >
          <Image className="w-[3.4375rem] h-[3.5rem]" src={smallTriangleImg} alt="" />
        </div>
      </div>

      <div className="absolute top-[55%] left-[67.97%] z-20">
        <div
          className="relative"
          ref={bigTriangleShakeRef}
        >
          <Image className="w-[9.5625rem] h-[5.875rem]" src={bigTriangleImg} alt="" />
        </div>
      </div>

      <PageDesc
        title="moonveil loyalty system"
        hasBelt
        needAni
        baseAniTY
        subtitle={
          <div className="max-w-[32.0625rem] font-decima text-lg">
            At Moonveil, player experience is of paramount importance. We are dedicated to recognizing and rewarding
            players&#39; contributions in our ecosystem by introducing the Moonveil Loyalty Program, centered around
            Moonveil Beam (MB) points.
          </div>
        }
      />

      <ScrollDownArrow />
    </div>
  );
}
