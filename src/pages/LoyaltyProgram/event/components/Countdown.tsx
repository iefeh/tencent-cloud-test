import dayjs from 'dayjs';
import { Fragment, useEffect, useRef, useState } from 'react';
import duration from 'dayjs/plugin/duration';
import calendarImg from 'img/loyalty/task/calendar.png';
import Image from 'next/image';

dayjs.extend(duration);

export function useCountdown(targetTime: number, currentTime = Date.now(), callback?: (time: number) => void) {
  const lastTimestamp = useRef(performance.now());
  const leftTime = useRef(Math.max(targetTime - currentTime, 0));
  const rafId = useRef(0);

  function run(el: number = performance.now()) {
    leftTime.current = Math.max(leftTime.current - el + lastTimestamp.current, 0);
    lastTimestamp.current = el;
    callback?.(leftTime.current);
    if (leftTime.current <= 0) return;
    rafId.current = requestAnimationFrame(run);
  }

  useEffect(() => {
    run();

    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
        rafId.current = 0;
      }
    };
  }, []);

  return { leftTime };
}

export default function Countdown() {
  const [leftTimes, setLeftTimes] = useState(['00', '00', '00', '00']);

  useCountdown(dayjs().add(31, 'd').valueOf(), dayjs().valueOf(), (diff) => {
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
            {index > 0 && <span className="w-[0.9375rem] text-center">:</span>}

            <div className={'w-10 h-10 border-1 border-basic-gray rounded-[0.3125rem] text-center leading-10'}>
              {time}
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
