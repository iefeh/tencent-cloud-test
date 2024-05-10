import Image from 'next/image';
import { FC } from 'react';
import MBInfo from '../MBInfo';
import TicketsInfo from '../TicketsInfo';
import TimeoutInfo from '../TimeoutInfo';
import DrawLimitsInfo from '../DrawLimitsInfo';

const DrawScreen: FC & BasePage = () => {
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
      <div className="absolute inset-0 z-10"></div>

      {/* 操作层 */}
      <div className="absolute inset-0 z-20">
        <MBInfo className="!absolute left-16 top-32" />

        <TicketsInfo className="!absolute left-16 top-[16.5625rem]" />

        <TimeoutInfo className="!absolute right-16 top-32" />

        <DrawLimitsInfo className="!absolute right-16 top-[17.125rem]" />
      </div>
    </div>
  );
};

export default DrawScreen;
