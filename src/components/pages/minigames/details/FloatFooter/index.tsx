import useCountdown from '@/hooks/useCountdown';
import { Button, cn } from '@nextui-org/react';
import dayjs from 'dayjs';
import Image from 'next/image';
import { FC, Fragment, useState } from 'react';
import styles from './index.module.scss';

const FloatFooter: FC = () => {
  const [cdNumbers, setCDNumbers] = useState(Array(4).fill('00'));
  // 注意du.days()会返回对30的模
  useCountdown(dayjs().add(20, 'days').valueOf(), dayjs().valueOf(), (time) => {
    const du = dayjs.duration(time);
    const nos = [du.days(), du.hours(), du.minutes(), du.seconds()].map((n) => n.toString().padStart(2, '0'));
    setCDNumbers(nos);
  });

  return (
    <div className="fixed z-[999] bottom-0 left-0 w-[120rem] h-[8.5rem] pointer-events-none">
      <Image
        className="object-cover"
        src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/minigames/bg_float.png"
        alt=""
        fill
        sizes="100%"
        priority
        unoptimized
      />

      <div className="relative z-0 right-[20.5rem] flex flex-col items-end mt-[0.8125rem] pointer-events-auto w-min ml-auto">
        <div className="h-[2.125rem] flex items-center">
          <Image
            className="object-contain w-[0.875rem] h-4 mr-2"
            src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/minigames/icons/icon_date.png"
            alt=""
            width={28}
            height={32}
            unoptimized
          />

          <span className="text-sm mr-[0.875rem]">Current tickets will expire in</span>

          {cdNumbers.map((no, index) => (
            <Fragment key={index}>
              {index > 0 && <span className="mx-1">:</span>}
              <div className="w-[2.125rem] h-[2.125rem] bg-[#E0D1B1] rounded-five text-brown leading-[2.125rem] text-center font-semibold">
                {no}
              </div>
            </Fragment>
          ))}
        </div>

        <div className="flex pr-1 mt-5">
          <Button
            className={cn([
              "bg-transparent bg-[url('https://moonveil-public.s3.ap-southeast-2.amazonaws.com/minigames/btn_brown.png')] bg-contain bg-no-repeat w-[10.875rem] h-[3.25rem] text-lg",
              styles.strokeText,
            ])}
            data-text="Share"
          />

          <Button
            className={cn([
              "bg-transparent bg-[url('https://moonveil-public.s3.ap-southeast-2.amazonaws.com/minigames/btn_yellow.png')] bg-contain bg-no-repeat w-[10.875rem] h-[3.25rem] text-lg ml-3 font-semibold",
              styles.strokeText,
            ])}
            data-text="Play Now"
          />

          <Button
            className={cn([
              "bg-transparent bg-[url('https://moonveil-public.s3.ap-southeast-2.amazonaws.com/minigames/btn_blue.png')] bg-contain bg-no-repeat w-[10.875rem] h-[3.25rem] text-lg ml-3",
              styles.strokeText,
              styles.blueStroke,
            ])}
            data-text="Buy Tickets"
          />

          <Button
            className={cn([
              "bg-transparent bg-[url('https://moonveil-public.s3.ap-southeast-2.amazonaws.com/minigames/btn_ticket.png')] bg-contain bg-no-repeat w-[9.0625rem] h-[3.25rem] text-lg leading-none ml-5",
              styles.strokeText,
              styles.yellowText,
            ])}
            data-text="10"
          >
            <span className="absolute top-0 right-2 text-sm leading-none text-white">Your Tickets</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FloatFooter;
