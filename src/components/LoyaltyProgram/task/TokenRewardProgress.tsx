import { Fragment } from 'react';
import { cn } from '@nextui-org/react';
import { observer } from 'mobx-react-lite';

interface Props {
  status: number;
}

function TokenRewardProgress({ status }: Props) {
  const progressData = [
    {
      label: 'Questing',
      checked: status >= 0,
    },
    {
      label: 'Raffling',
      checked: status >= 1,
    },
    {
      label: 'Claiming',
      checked: status >= 2,
    },
  ];

  return (
    <div className="flex justify-between items-center pl-7 pr-24 gap-x-4">
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
                'absolute -bottom-7 left-1/2 -translate-x-1/2 w-max text-sm leading-none',
                item.checked || 'text-[#999]',
              ])}
            >
              {item.label}
            </div>
          </div>
        </Fragment>
      ))}
    </div>
  );
}

export default observer(TokenRewardProgress);
