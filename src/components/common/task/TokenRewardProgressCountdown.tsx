import useCountdown from '@/hooks/useCountdown';
import { cn } from '@nextui-org/react';
import dayjs from 'dayjs';
import { FC, Fragment, useState } from 'react';

interface Props {
  isBrown?: boolean;
  label: string;
  endTime?: number | null;
}

const TokenRewardProgressCountdown: FC<Props> = ({ isBrown, label, endTime }) => {
  const [cdNumbers, setCDNumbers] = useState(Array(4).fill('00'));
  // 注意du.days()会返回对30的模
  useCountdown(endTime || dayjs().valueOf(), dayjs().valueOf(), (time) => {
    const du = dayjs.duration(time);
    const nos = [~~du.asDays(), du.hours(), du.minutes(), du.seconds()].map((n) => n.toString().padStart(2, '0'));
    setCDNumbers(nos);
  });

  return (
    <>
      <div className="h-[2.125rem] flex items-center">
        <span className="mr-2">{label} will end in</span>

        {cdNumbers.map((no, index) => (
          <Fragment key={index}>
            {index > 0 && <span className="mx-1">:</span>}
            <div
              className={cn([
                'aspect-square bg-[#E0D1B1] rounded-five text-brown text-center font-semibold',
                'text-base w-[2.125rem] leading-[2.125rem]',
              ])}
            >
              {no}
            </div>
          </Fragment>
        ))}
      </div>

      <div className={cn(["w-full h-0 border-t-1 md: border-dashed mt-5", isBrown ? 'border-brown/20' : 'border-[#E0D1B1]/50'])}></div>
    </>
  );
};

export default TokenRewardProgressCountdown;
