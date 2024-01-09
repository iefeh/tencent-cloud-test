import PageDesc from '@/pages/components/common/PageDesc';
import Image from 'next/image';
import mbImg from 'img/loyalty/intro/mb.png';
import { useRef } from 'react';
import useShake from '@/hooks/useShake';

export default function WhatIsMBScreen() {
  const shakeRef = useRef<HTMLDivElement>(null);

  useShake(shakeRef);

  return (
    <div className="w-full h-auto flex justify-center items-center relative sm:h-screen">
      <div className="flex justify-center gap-[5.625rem] w-auto flex-col sm:flex-row sm:items-center">
        <div>
          <div className="relative hover:shadow-[0_0_8px_4px_rgba(246,199,153,0.1)] transition-shadow" ref={shakeRef}>
            <Image className="w-[45.3125rem] h-[40rem] object-contain" src={mbImg} alt="" />
            <div className="mask absolute w-full h-full left-0 top-0 z-0 transition-shadow duration-300 will-change-transform"></div>
          </div>
        </div>

        <PageDesc
          hasBelt
          className="text-left max-w-[32.125rem] mt-[3rem] px-16 sm:px-0"
          needAni
          baseAniTY
          title={
            <div className="font-semakin text-6xl mb-12">
              <div>What is</div>
              <div className="text-basic-yellow">Moon Beam</div>
            </div>
          }
          subtitle={
            <div className="text-lg font-decima mb-10 tracking-tighter">
              <div>
                Moon Beams are the native points of Moonveil’s ecosystem that symbolize player contribution and
                participation. Moon Beams can be earned by engaging with the community, fantastic in-game performance,
                and completing tasks from the website.
              </div>
              <br />
              <div>
                As the central point system, Moon Beams ensures lasting benefits to the most loyal community members in
                the Moonveil ecosystem. Players can exchange their Moon Beams for a variety of rewards, including
                exclusive in-game assets and on-chain assets. Collecting additional MBs will also provide opportunities
                for our NFT whitelist events, token airdrops, and various premium perks.
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
}
