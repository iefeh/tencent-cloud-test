import { Fragment, useContext } from 'react';
import { MintContext } from '..';
import { MintStatus } from '@/constant/mint';
import { cn } from '@nextui-org/react';
import { observer } from 'mobx-react-lite';

function MintProgress() {
  const { status } = useContext(MintContext);
  const progressData = [
    {
      label: 'Connect Wallet',
      checked: status >= MintStatus.CONNECTED,
    },
    {
      label: 'Correct Network',
      checked: status >= MintStatus.CORRECTED_NETWORK,
    },
    {
      label: 'Whitelisted',
      checked: status >= MintStatus.WHITELISTED,
    },
  ];

  return (
    <div className="flex justify-between items-center mt-[3.875rem]">
      {progressData.map((item, index) => (
        <Fragment key={index}>
          {index > 0 && (
            <div
              className={cn([
                'w-[10.5625rem] h-[0.0625rem] mx-[0.9375rem]',
                item.checked ? 'bg-white' : 'bg-[rgba(255,255,255,0.2)]',
              ])}
            ></div>
          )}

          <div
            className={cn([
              'w-2 h-2 rounded-full relative',
              index > 0 && 'ml-3',
              item.checked ? 'bg-white' : 'bg-transparent',
            ])}
          >
            <div
              className={cn([
                'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 border-1 rounded-full',
                item.checked ? 'border-white' : 'border-[rgba(255,255,255,0.2)]',
              ])}
            ></div>

            <div className={cn(['absolute -bottom-10 left-1/2 -translate-x-1/2 w-max', item.checked || 'text-[#999]'])}>
              {item.label}
            </div>
          </div>
        </Fragment>
      ))}
    </div>
  );
}

export default observer(MintProgress);
