import dayjs from 'dayjs';
import { Fragment, useState } from 'react';
import duration from 'dayjs/plugin/duration';
import calendarImg from 'img/loyalty/task/calendar.png';
import Image from 'next/image';
import useCountdown from '@/hooks/useCountdown';

dayjs.extend(duration);
interface Props {
  end?: number | string;
}

export default function Countdown(props: Props) {
  const { end } = props;
  const [leftTimes, setLeftTimes] = useState(['00', '00', '00', '00']);
  const target = end || Date.now();

  useCountdown(dayjs(target).valueOf(), dayjs().valueOf(), (diff) => {
    const du = dayjs.duration(diff);
    setLeftTimes([~~du.asDays(), du.hours(), du.minutes(), du.seconds()].map((t) => t.toString().padStart(2, '0')));
  });

  return (
    <div className="flex justify-between items-center pt-[1.3125rem] pr-[1.3125rem] pb-[0.9375rem] pl-[1.5625rem] border-b-1 border-basic-gray">
      <div className="flex items-center">
        <Image className="w-[0.875rem] h-4" src={calendarImg} alt="" width={14} height={16} />
        <div className="font-poppins text-sm ml-[0.625rem]">End Date of the Event :</div>
      </div>

      <div className="flex items-center font-semakin text-xl text-basic-yellow">
        {leftTimes.map((time, index) => (
          <Fragment key={index}>
            {index > 0 && <span className="text-center">:</span>}

            <div
              className={'h-10 border-1 border-basic-gray rounded-[0.3125rem] text-center leading-10'}
              style={{ width: `${1.25 * Math.max(~~Math.log10(+time) + 1, 2)}rem` }}
            >
              {time}
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
