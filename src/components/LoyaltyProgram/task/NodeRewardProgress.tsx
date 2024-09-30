import { Fragment } from 'react';
import { cn } from '@nextui-org/react';
import TokenRewardProgressCountdown from '@/components/common/task/TokenRewardProgressCountdown';

interface Props {
  status: number;
  endTime?: number;
}

function NodeRewardProgress({ status, endTime }: Props) {
  console.log(111111, status, endTime)
  const progressData = [
    {
      label: 'Questing',
      checked: status >= 0,
    },
    {
      label: 'Raffle',
      checked: status >= 1,
    },
    {
      label: 'Reward',
      checked: status >= 2,
    },
  ];

  function getProgressLabel(val = status): string {
    if (val < 0) return '-';

    return progressData[val]?.label || getProgressLabel(val - 1);
  }

  return (
    <>
      <div className="flex justify-between items-center pl-7 pr-24 gap-x-4 mb-12">
        {progressData.map((item, index) => (
          <Fragment key={index}>
            {index > 0 && (
              <div
                className={cn([
                  'w-28 lg:w-[10.5625rem] h-1px bg-current',
                  item.checked ? 'text-basic-yellow' : 'text-white',
                ])}
              ></div>
            )}

            <div
              className={cn([
                'w-2 h-2 rounded-full relative shrink-0 bg-current',
                item.checked ? 'text-basic-yellow' : 'text-white',
              ])}
            >
              <div
                className={cn([
                  'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 border-1 rounded-full border-current',
                ])}
              ></div>

              <div
                className={cn([
                  'absolute -bottom-7 left-1/2 -translate-x-1/2 w-max text-sm leading-none capitalize',
                  item.checked || 'text-[#999]',
                ])}
              >
                {item.label}
              </div>
            </div>
          </Fragment>
        ))}
      </div>

      <TokenRewardProgressCountdown label={getProgressLabel(status)} endTime={endTime} />
    </>
  );
}

export default NodeRewardProgress;
