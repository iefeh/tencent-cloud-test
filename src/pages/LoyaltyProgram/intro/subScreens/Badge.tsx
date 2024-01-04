import PageDesc from '@/pages/components/common/PageDesc';
import Image from 'next/image';
import badgesImg from 'img/loyalty/intro/badges.png';
import { useRef } from 'react';
import useShake from '@/hooks/useShake';

export default function BadgeScreen() {
  const shakeRef = useRef<HTMLDivElement>(null);

  useShake(shakeRef);

  return (
    <div className="w-full h-auto flex justify-center items-center relative sm:h-screen">
      <div className="flex justify-center gap-[5.625rem] w-auto flex-col sm:flex-row sm:items-center">
        <PageDesc
          hasBelt
          className="text-left max-w-[36rem] mt-[6rem] order-2 sm:order-1 px-8 sm:px-0"
          needAni
          baseAniTY
          title="Moonveil Badge System"
          subtitle="In collaboration with Moon Beams, we proudly present the Moonveil Badge System as part of our Loyalty Program. A diverse range of badges have been meticulously crafted to track and reward player engagement. These badges not only commemorate players' achievements but also unlock additional exclusive perks, including MBs and exciting bonuses yet to be revealed."
        />

        <div className="order-1 sm:order-2">
          <div className="relative hover:shadow-[0_0_8px_4px_rgba(246,199,153,0.1)] transition-shadow" ref={shakeRef}>
            <Image className="w-[45.3125rem] h-[40rem] object-contain" src={badgesImg} alt="" />
            <div className="mask absolute w-full h-full left-0 top-0 z-0 transition-shadow duration-300 will-change-transform"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
