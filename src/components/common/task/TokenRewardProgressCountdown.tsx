import useCountdown from '@/hooks/useCountdown';
import { cn } from '@nextui-org/react';
import dayjs from 'dayjs';
import { FC, Fragment, useState } from 'react';

interface Props {
  taskId?: string;
  isBrown?: boolean;
  label: string;
  endTime?: number | null;
}

const TokenRewardProgressCountdown: FC<Props> = ({ taskId, isBrown, label, endTime }) => {
  const nodeTaskIds = [
    '1c142228-3048-483c-b896-7e215c22bc9c',
    'bb2eeb94-a53c-4c63-a1a6-5689732548c9',
    '831853ca-65c8-49c4-8e51-dda991bff62c',
    'e7818cc9-0d12-4a2e-b60d-a83fc5ebae69',
    'fae252f5-d8b3-4324-9403-816353801c8c',
    '2cc40dd7-9672-403d-ad8c-bd04f761f349',
  ];
  const isNodeTask = !!taskId && nodeTaskIds.includes(taskId);
  const [cdNumbers, setCDNumbers] = useState(Array(4).fill('00'));
  // 注意du.days()会返回对30的模
  useCountdown(endTime || dayjs().valueOf(), dayjs().valueOf(), (time) => {
    const du = dayjs.duration(time);
    let days: number | string = ~~du.asDays();
    if (days > 99) days = '99+';
    const nos = [days, du.hours(), du.minutes(), du.seconds()].map((n) => n.toString().padStart(2, '0'));
    setCDNumbers(nos);
  });

  return (
    <>
      <div className="h-[1.625rem] flex items-center">
        <span className="mr-2 text-sm">
          {isNodeTask && label === 'Questing' ? 'Claiming will start in' : `${label} will end in`}
        </span>

        {cdNumbers.map((no, index) => (
          <Fragment key={index}>
            {index > 0 && <span className="mx-1">:</span>}
            <div
              className={cn([
                'px-1 bg-[#E0D1B1] rounded-five text-brown text-center font-semibold',
                'text-sm h-full min-w-[1.625rem] leading-[1.625rem]',
              ])}
            >
              {no}
            </div>
          </Fragment>
        ))}
      </div>

      <div
        className={cn([
          'w-full h-0 border-t-1 md: border-dashed mt-5',
          isBrown ? 'border-brown/20' : 'border-[#E0D1B1]/50',
        ])}
      ></div>
    </>
  );
};

export default TokenRewardProgressCountdown;
