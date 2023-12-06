import PageDesc from '@/pages/components/common/PageDesc';
import Image from 'next/image';
import mbImg from 'img/loyalty/intro/mb.png';
import { useRef } from 'react';
import useShake from '@/hooks/useShake';

export default function WhatIsMBScreen() {
  const shakeRef = useRef<HTMLDivElement>(null);

  useShake(shakeRef);

  return (
    <div className="w-full h-screen flex justify-center items-center relative">
      <div className="flex justify-center gap-[5.625rem] w-auto">
        <div>
          <div ref={shakeRef}>
            <Image className="w-[45.3125rem] h-[40rem]" src={mbImg} alt="" />
          </div>
        </div>

        <PageDesc
          hasBelt
          className="text-left max-w-[32.125rem] mt-[6.5rem]"
          needAni
          baseAniTY
          title={
            <div className="font-semakin text-6xl mb-12">
              <div>What is</div>
              <div className="text-basic-yellow">Moon Beams</div>
            </div>
          }
          subtitle="Moon Beams are the native points of Moonveil’s ecosystem and symbolize player contributions and participation. As our central points system, MBs ensure lasting cash equivalent benefits. Players can exchange their accumulated MBs for a variety of rewards including exclusive in-game assets, on-chain assets, and cash rebates. Accumulating more MBs will also grant access to our exclusive events and premium rewards."
        />
      </div>
    </div>
  );
}
