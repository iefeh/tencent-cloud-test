import useCountdown from '@/hooks/useCountdown';
import dayjs from 'dayjs';
import Image from 'next/image';
import { FC, Fragment, useState } from 'react';

interface Props {
  endTime?: number;
}

const TicketCountdown: FC<Props> = ({ endTime = dayjs().add(20, 'days').valueOf() }) => {
  const [cdNumbers, setCDNumbers] = useState(Array(4).fill('00'));
  // 注意du.days()会返回对30的模
  useCountdown(endTime, dayjs().valueOf(), (time) => {
    const du = dayjs.duration(time);
    const nos = [du.days(), du.hours(), du.minutes(), du.seconds()].map((n) => n.toString().padStart(2, '0'));
    setCDNumbers(nos);
  });

  return (
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
  );
};

export default TicketCountdown;
