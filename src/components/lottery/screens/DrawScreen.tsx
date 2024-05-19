import Image from 'next/image';
import { FC, useState } from 'react';
import MBInfo from '../MBInfo';
import TicketsInfo from '../TicketsInfo';
import TimeoutInfo from '../TimeoutInfo';
import DrawLimitsInfo from '../DrawLimitsInfo';
import DrawScreenMainContent from '../DrawScreenMainContent';
import DrawFooter from '../DrawFooter';
import PlanetAni from '../PlanetAni';
import { useDisclosure } from '@nextui-org/react';
import RewardsModal from '../RewardsModal';
import { Lottery } from '@/types/lottery';
import PrizePoolModal from '../PrizePoolModal';
import usePrizePool from '../hooks/usePrizePool';

const DrawScreen: FC & BasePage = () => {
  const [currentReward, setCurrentReward] = useState<Lottery.RewardDTO | null>(null);
  const rewardsDisclosure = useDisclosure();
  const { disclosure: prizePoolDisclosure, poolInfo, onShowPrizePool } = usePrizePool();

  function onDrawed(item?: Lottery.RewardDTO) {
    setCurrentReward(item || null);
    rewardsDisclosure.onOpen();
  }

  return (
    <div className="relative w-screen h-screen">
      {/* 背景层 */}
      <div className="absolute inset-0 z-0">
        <div className="w-[106.3125rem] h-[31.6875rem] absolute bottom-0 left-1/2 -translate-x-1/2">
          <Image
            src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/lottery/draw_bottom_planet.png"
            alt=""
            fill
            sizes="100%"
            unoptimized
          />
        </div>
      </div>

      {/* 动画层 */}
      <div className="absolute inset-0 z-10">
        <PlanetAni />
      </div>

      {/* 操作层 */}
      <div className="absolute inset-0 z-20 flex justify-center items-center">
        <MBInfo className="!absolute left-16 top-32" />

        <TicketsInfo className="!absolute left-16 top-[16.5625rem]" item={poolInfo} />

        <TimeoutInfo className="!absolute right-16 top-32" key={poolInfo?.end_time} item={poolInfo} />

        <DrawLimitsInfo className="!absolute right-16 top-[17.125rem]" item={poolInfo} />

        <DrawFooter
          className="!absolute bottom-[7.5rem] left-1/2 -translate-x-1/2"
          item={poolInfo}
          onDrawed={onDrawed}
        />

        <DrawScreenMainContent onShowPrizePool={onShowPrizePool} />
      </div>

      <RewardsModal item={currentReward} disclosure={rewardsDisclosure} />

      <PrizePoolModal disclosure={prizePoolDisclosure} item={poolInfo} />
    </div>
  );
};

export default DrawScreen;
