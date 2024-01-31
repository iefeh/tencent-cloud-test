import { Fragment, useContext } from 'react';
import { MintContext } from '..';
import { cn } from '@nextui-org/react';
import { observer } from 'mobx-react-lite';

function MintProgress() {
  const { isConnected, isNetCorrected, isWhitelistChecked } = useContext(MintContext);
  const progressData = [
    {
      label: 'Connect Wallet',
      checked: isConnected,
    },
    {
      label: 'Correct Network',
      checked: isNetCorrected,
    },
    {
      label: 'Whitelisted',
      checked: isWhitelistChecked,
    },
  ];

  return (
    <div className="flex justify-between items-center mt-8">
      {progressData.map((item, index) => (
        <Fragment key={index}>
          {index > 0 && (
            <div
              className={cn([
                'w-28 lg:w-[10.5625rem] h-[0.0625rem] mx-[0.9375rem]',
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
