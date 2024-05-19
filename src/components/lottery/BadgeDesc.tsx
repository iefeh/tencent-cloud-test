import LGButton from '@/pages/components/common/buttons/LGButton';
import { cn } from '@nextui-org/react';
import Image from 'next/image';
import { FC } from 'react';
import BattlePassButton from '../LoyaltyProgram/season/BattlePassButton';

const BadgeDesc: FC = () => {
  return (
    <div className="flex items-center">
      <div className="w-[24.5rem] h-[22.125rem] relative">
        <Image
          className="object-contain"
          src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/lottery/badge_master.png"
          alt=""
          fill
          sizes="100%"
          unoptimized
        />
      </div>

      <div className={cn(['w-[43.0625rem] h-[19.9375rem] relative'])}>
        <Image
          src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/lottery/bg_badge_desc.png"
          alt=""
          fill
          sizes="100%"
          unoptimized
        />

        <div className="w-full h-full relative z-0 pt-7 pb-10 pl-[2.125rem] pr-[1.125rem] flex flex-col justify-between">
          <div className="font-semakin text-4xl leading-none">
            <span className="bg-gradient-to-b from-[#efebc5] to-[#d9a970] bg-clip-text text-transparent">
              “Lucky Draw Master”
            </span>{' '}
            Badge
          </div>

          <div className="text-lg">
            <p>
              Level up with every draw!
              <br />
              You can unlock the Lucky Draw Master Badge by accumulating draw counts, with the badge level increasing as
              you make more draws.
            </p>

            <p className="text-basic-yellow italic">
              *Surprise bonus: Achieving a Lv2 Lucky Draw Master Badge in Season 1 will grant you an S1 Premium Pass for
              free!
            </p>
          </div>

          <div className="flex">
            <BattlePassButton />

            <LGButton className="ml-7" label="My Badges" link="/Profile/MyBadges" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BadgeDesc;
