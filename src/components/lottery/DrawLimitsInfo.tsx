import { cn } from '@nextui-org/react';
import Image from 'next/image';
import { FC } from 'react';

const DrawLimitsInfo: FC<ClassNameProps> = ({ className }) => {
  return (
    <div
      className={cn([
        'w-[16.5rem] h-[3.5625rem] leading-[3.5625rem] text-center',
        'relative flex justify-between items-center',
        className,
      ])}
    >
      <Image
        src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/lottery/bg_draw_limits_info.png"
        alt=""
        fill
        sizes="100%"
        unoptimized
      />

      <div className="flex-1 font-semakin relative z-0 text-xl">
        <span className="text-light-yellow mr-4">Draw Limits: </span>0/10
      </div>
    </div>
  );
};

export default DrawLimitsInfo;
