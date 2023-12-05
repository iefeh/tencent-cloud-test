import PageDesc from '@/pages/components/common/PageDesc';
import Image from 'next/image';
import badgesImg from 'img/loyalty/intro/badges.png';
import { useRef } from 'react';
import { useShake } from '../utils';

export default function BadgeScreen() {
  const shakeRef = useRef<HTMLDivElement>(null);

  useShake(shakeRef);

  return (
    <div className="w-full h-screen flex justify-center items-center relative">
      <div className="flex justify-center gap-[5.625rem] w-auto">
        <PageDesc
          hasBelt
          className="text-left max-w-[36rem] mt-[6rem]"
          needAni
          baseAniTY
          title="Moonveil Badge System"
          subtitle="In collaboration with Moon Beams, we proudly present the Moonveil Badge System as part of our Loyalty Program. A diverse range of badges has been meticulously crafted to track and reward player engagement. These badges not only commemorate players' achievements but also unlock additional exclusive perks, including MBs and exciting bonuses yet to be revealed."
        />

        <div>
          <div ref={shakeRef}>
            <Image className="w-[45.3125rem] h-[40rem]" src={badgesImg} alt="" />
          </div>
        </div>
      </div>
    </div>
  );
}
