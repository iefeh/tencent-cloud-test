import useCountdown from '@/hooks/useCountdown';
import { cn } from '@nextui-org/react';
import dayjs from 'dayjs';
import Image from 'next/image';
import { FC, Fragment, useState } from 'react';

const TimeoutInfo: FC<ClassNameProps> = ({ className }) => {
  const [times, setTimes] = useState(['00', '00', '00', '00']);
  useCountdown(dayjs().add(1, 'day').valueOf(), dayjs().valueOf(), (leftTime) => {
    const duration = dayjs.duration(leftTime);
    setTimes(duration.format('DD:HH:mm:ss').split(':'));
  });

  return (
    <div className={cn(['w-[26.375rem] h-[7.625rem] pl-[1.8125rem] pr-[1.625rem] pt-4 relative', className])}>
      <Image
        src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/lottery/bg_timeout_info.png"
        alt=""
        fill
        sizes="100%"
        unoptimized
      />

      <p className="font-semakin text-xl bg-gradient-to-b from-[#E7D4A9] to-[#DBAC74] bg-clip-text text-transparent relative z-0 w-min whitespace-nowrap ml-auto">
        The lottery pool will close in:
      </p>

      <div className="flex items-center w-min font-semakin text-xl relative z-0 ml-auto mt-3">
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

export default TimeoutInfo;
