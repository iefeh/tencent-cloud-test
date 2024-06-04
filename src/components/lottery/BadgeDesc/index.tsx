import LGButton from '@/pages/components/common/buttons/LGButton';
import { cn } from '@nextui-org/react';
import Image from 'next/image';
import { FC } from 'react';
import BattlePassButton from '../../LoyaltyProgram/season/BattlePassButton';
import { Lottery } from '@/types/lottery';
import styles from './index.module.css';
import { isMobile } from 'react-device-detect';

interface Props {
  milestone: Lottery.MilestoneDTO | null;
}

const BadgeDesc: FC<Props> = ({ milestone }) => {
  return (
    <div className="flex flex-col lg:flex-row items-center">
      <div className="w-80 h-[18.0625rem] lg:w-[24.5rem] lg:h-[22.125rem] relative origin-center animate-shaking">
        <Image
          className="object-contain"
          src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/lottery/badge_master.png"
          alt=""
          fill
          sizes="100%"
          unoptimized
        />
      </div>

      <div className={cn(['w-[24rem] h-auto lg:w-[43.0625rem] lg:h-[19.9375rem] relative', styles.badgeDesc])}>
        {/* <Image
          src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/lottery/bg_badge_desc.png"
          alt=""
          fill
          sizes="100%"
          unoptimized
        /> */}

        <div className="w-full h-full relative z-10 py-0 lg:pt-7 lg:pb-10 pl-[2.125rem] pr-[1.125rem] flex flex-col justify-between">
          <div className="font-semakin text-2xl lg:text-4xl leading-9 lg:leading-none">
            <span className="bg-gradient-to-b from-[#efebc5] to-[#d9a970] bg-clip-text text-transparent">
              “{milestone?.luckyDrawBadge?.name || 'Lucky Draw Master'}”
            </span>
            {isMobile ? <br /> : ' '}
            Badge
          </div>

          <div className="text-base lg:text-lg">
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

          <div className="flex flex-col lg:flex-row gap-7 mt-4 lg:mt-0">
            <BattlePassButton className="!items-start !lg:items-center" />

            <LGButton label="My Badges" link="/Profile/MyBadges" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BadgeDesc;
