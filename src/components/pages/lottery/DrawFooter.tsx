import { cn } from '@nextui-org/react';
import Image from 'next/image';
import { FC } from 'react';
import mbImg from 'img/loyalty/earn/mb.png';
import LGButton from '@/pages/components/common/buttons/LGButton';
import { Lottery } from '@/types/lottery';

interface Props extends ClassNameProps {
  onDraw?: (times: number) => void;
}

const DrawFooter: FC<Props & ItemProps<Lottery.Pool>> = ({ className, onDraw, item: poolInfo }) => {
  const buttons = getButtons();

  function getButtons() {
    const maxDrawTimes = poolInfo?.draw_limits || 0;
    const list = [];

    if (maxDrawTimes >= 1) {
      list.push({
        icon: 'https://d3dhz6pjw7pz9d.cloudfront.net/lottery/ticket_free.png',
        label: '1 Free Ticket',
        buttonLabel: 'Draw Once',
        times: 1,
      });
    }

    if (maxDrawTimes >= 3) {
      list.push({
        icon: mbImg,
        label: '75MBs',
        buttonLabel: 'Draw 3 Times',
        times: 3,
      });
    }

    if (maxDrawTimes >= 5) {
      list.push({
        icon: mbImg,
        label: '125MBs',
        buttonLabel: 'Draw 5 Times',
        times: 5,
      });
    }

    return list;
  }

  return (
    <div className={cn(['flex flex-col items-center', className])}>
      <div className="text-basic-yellow text-lg mb-1">Your remaining Draw: {poolInfo?.rest_draw_amount || 0}</div>

      <div className="w-[28rem] h-[4.6875rem] lg:w-[42.6875rem] lg:h-[7.125rem] relative">
        <Image
          className={cn([
            'object-contain rounded-xl shadow-[0_0_0.75rem_0.125rem_#f6c799]',
            ((poolInfo?.draw_limits || 0) - (poolInfo?.rest_draw_amount || 0) || 0) >= 3 && 'hidden',
          ])}
          src="https://d3dhz6pjw7pz9d.cloudfront.net/lottery/card_discount.png"
          alt=""
          fill
          sizes="100%"
          unoptimized
        />
      </div>

      <div className="flex justify-between gap-x-4 gap-y-4 flex-col lg:flex-row lg:gap-x-28 mt-ten">
        {buttons.map((item, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className="flex justify-center items-center">
              <div className="w-[2.6875rem] h-[3.8125rem] relative">
                <Image className="object-contain" src={item.icon} alt="" fill sizes="100%" unoptimized />
              </div>

              <div className="font-semakin text-lg ml-3">{item.label}</div>
            </div>

            <LGButton
              label={item.buttonLabel}
              actived
              needAuth
              disabled={!poolInfo || poolInfo.rest_draw_amount < item.times}
              onClick={() => onDraw?.(item.times)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DrawFooter;
