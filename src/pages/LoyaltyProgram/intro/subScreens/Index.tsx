import PageDesc from '@/components/common/PageDesc';
import ScrollDownArrow from '@/pages/components/common/ScrollDownArrow';
import Image from 'next/image';
import bgImg from 'img/loyalty/intro/bg_home.jpg';
import smallTriangleImg from 'img/loyalty/intro/triangle_small.png';
import bigTriangleImg from 'img/loyalty/intro/triangle_big.png';
import { useRef } from 'react';
import useShake from '@/hooks/useShake';
import BasicButton from '@/pages/components/common/BasicButton';

export default function IndexScreen() {
  const smallTriangleShakeRef = useRef<HTMLDivElement>(null);
  const bigTriangleShakeRef = useRef<HTMLDivElement>(null);

  useShake(smallTriangleShakeRef, { maxDegX: 30, maxDegY: 15 });
  useShake(bigTriangleShakeRef, { maxDegX: 30, maxDegY: 15 });

  return (
    <div className="w-full h-screen flex justify-center items-center relative">
      <Image className="object-cover" src={bgImg} alt="" fill />

      <div className="absolute top-[22.5%] left-[22.34%] z-10">
        <div className="relative" ref={smallTriangleShakeRef}>
          <Image className="w-[3.4375rem] h-[3.5rem]" src={smallTriangleImg} alt="" />
        </div>
      </div>

      <div className="absolute top-[55%] left-[67.97%] z-20 hidden sm:block">
        <div className="relative" ref={bigTriangleShakeRef}>
          <Image className="w-[9.5625rem] h-[5.875rem]" src={bigTriangleImg} alt="" />
        </div>
      </div>

      <PageDesc
        title="moonveil loyalty program"
        hasBelt
        needAni
        baseAniTY
        subtitle={
          <div className="max-w-[36rem] font-decima text-lg px-8 sm:px-0 mb-10">
            At Moonveil, we prioritize player experience above all. We are dedicated to acknowledging and rewarding the
            contribution of our players to our ecosystem. Central to this program are Moon Beams (MBs) which are
            designed to reward community members who help in the growth of the Moonveil community.
          </div>
        }
        button={
          <div className="flex items-center gap-2">
            <BasicButton label="Earn Moon Beams" link="/LoyaltyProgram/earn" />
            <BasicButton label="Join Lottery" link="/lottery" />
          </div>
        }
      />

      <ScrollDownArrow />
    </div>
  );
}
