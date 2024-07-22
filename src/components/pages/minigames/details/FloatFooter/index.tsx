import useCountdown from '@/hooks/useCountdown';
import { Button, cn } from '@nextui-org/react';
import dayjs from 'dayjs';
import Image from 'next/image';
import { FC, Fragment, useState } from 'react';
import styles from './index.module.scss';

const FloatFooter: FC = () => {
  const [cdNumbers, setCDNumbers] = useState(Array(4).fill('00'));
  useCountdown(dayjs().add(31, 'day').valueOf(), Date.now(), (time) => {
    const du = dayjs.duration(time);
    const nos = [du.days(), du.hours(), du.minutes(), du.seconds()].map((n) => n.toString().padStart(2, '0'));
    setCDNumbers(nos);
  });

  return (
    <div className="fixed bottom-0 left-0 w-[120rem] h-[8.5rem] pointer-events-none">
      <Image
        className="object-cover"
        src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/minigames/bg_float.png"
        alt=""
        fill
        sizes="100%"
        priority
        unoptimized
      />

      <div className="relative z-0 right-[21rem] flex flex-col items-end mt-[0.8125rem] pointer-events-auto w-min ml-auto">
        <div className="h-[2.125rem] flex items-center">
          <Image
            className="object-contain w-[0.875rem] h-4 mr-1"
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
              <div className="w-[2.125rem] h-[2.125rem] bg-[#E0D1B1] rounded-5 text-[#5C0F0F] leading-[2.125rem] text-center font-semibold">
                {no}
              </div>
            </Fragment>
          ))}
        </div>

        <div className="flex pr-1 mt-5">
          <Button className="bg-transparent bg-[url('https://moonveil-public.s3.ap-southeast-2.amazonaws.com/minigames/btn_brown.png')] bg-contain bg-no-repeat w-[10.875rem] h-[3.25rem] text-lg">
            Share
          </Button>

          <Button
            className={cn([
              "bg-transparent bg-[url('https://moonveil-public.s3.ap-southeast-2.amazonaws.com/minigames/btn_yellow.png')] bg-contain bg-no-repeat w-[10.875rem] h-[3.25rem] text-lg ml-3 font-semibold",
              styles.strokeText,
            ])}
            data-text="Play Now"
          ></Button>

          <Button className="bg-transparent bg-[url('https://moonveil-public.s3.ap-southeast-2.amazonaws.com/minigames/btn_blue.png')] bg-contain bg-no-repeat w-[10.875rem] h-[3.25rem] text-lg ml-3">
            Buy Tickets
          </Button>

          <Button className="bg-transparent bg-[url('https://moonveil-public.s3.ap-southeast-2.amazonaws.com/minigames/btn_ticket.png')] bg-contain bg-no-repeat w-[9.0625rem] h-[3.25rem] text-sm leading-none ml-5">
            <span className="relative -top-[1.1563rem] left-[1.3125rem]">Your Tickets</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FloatFooter;
