import useCountdown from '@/hooks/useCountdown';
import { Lottery } from '@/types/lottery';
import { cn } from '@nextui-org/react';
import dayjs from 'dayjs';
import Image from 'next/image';
import { FC, Fragment, useState } from 'react';

const PrizePoolTimeoutInfo: FC<ClassNameProps & ItemProps<Lottery.Pool>> = ({ className, item }) => {
  const [times, setTimes] = useState(['00', '00', '00', '00']);
  useCountdown(item?.end_time || dayjs().valueOf(), dayjs().valueOf(), (leftTime) => {
    const duration = dayjs.duration(leftTime);
    setTimes(duration.format('DD:HH:mm:ss').split(':'));
  });

  return (
    <div
      className={cn([
        'w-full h-auto lg:w-[45.875rem] lg:h-[4.875rem] px-[3.0625rem] py-[0.875rem] relative flex items-center flex-col lg:flex-row',
        className,
      ])}
    >
      <Image
        src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/lottery/bg_prize_pool_timeout.png"
        alt=""
        fill
        sizes="100%"
        unoptimized
      />

      <p className="text-xl font-bold relative z-0 w-min whitespace-nowrap uppercase">The draw pool will close in</p>

      <div className="flex items-center w-min font-semakin text-xl relative z-0 ml-auto">
        {times.map((item, index) => (
          <Fragment key={index}>
            {index > 0 && <div className="mx-ten">:</div>}

            <div className="w-[3.125rem] h-[3.125rem] border-1 border-light-yellow leading-[3.125rem] text-center rounded-base">
              {item}
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
};

export default PrizePoolTimeoutInfo;
