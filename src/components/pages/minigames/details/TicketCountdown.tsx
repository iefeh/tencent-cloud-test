import useCountdown from '@/hooks/useCountdown';
import { cn } from '@nextui-org/react';
import dayjs from 'dayjs';
import { observer } from 'mobx-react-lite';
import Image from 'next/image';
import { FC, Fragment, useState } from 'react';

interface Props {
  endTime?: number | null;
  isBrown?: boolean;
  isSmall?: boolean;
}

const TicketCountdown: FC<Props> = ({ endTime, isBrown, isSmall }) => {
  const [cdNumbers, setCDNumbers] = useState(Array(4).fill('00'));
  // 注意du.days()会返回对30的模
  useCountdown(endTime || dayjs().valueOf(), dayjs().valueOf(), (time) => {
    const du = dayjs.duration(time);
    const nos = [~~du.asDays(), du.hours(), du.minutes(), du.seconds()].map((n) => n.toString().padStart(2, '0'));
    setCDNumbers(nos);
  });

  return (
    <div className="h-[2.125rem] flex items-center">
      <Image
        className="object-contain w-[0.875rem] h-4 mr-2"
        src={`https://moonveil-public.s3.ap-southeast-2.amazonaws.com/minigames/icons/icon_${
          isBrown ? 'date_brown' : 'date'
        }.png`}
        alt=""
        width={28}
        height={32}
        unoptimized
      />

      <span className={cn(['whitespace-nowrap', isSmall ? 'text-[0.875rem] mr-[0.625rem]' : 'text-sm mr-[0.875rem]'])}>
        Current tickets will expire in
      </span>

      {cdNumbers.map((no, index) => (
        <Fragment key={index}>
          {index > 0 && <span className="mx-1">:</span>}
          <div
            className={cn([
              'aspect-square bg-[#E0D1B1] rounded-five text-brown text-center font-semibold',
              isSmall ? 'text-[0.84375rem] w-[1.75rem] leading-[1.75rem]' : 'text-base w-[2.125rem] leading-[2.125rem]',
            ])}
          >
            {no}
          </div>
        </Fragment>
      ))}
    </div>
  );
};

export default observer(TicketCountdown);
