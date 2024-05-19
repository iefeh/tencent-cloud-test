import { cn } from '@nextui-org/react';
import Image from 'next/image';
import { FC, useState } from 'react';
import mbImg from 'img/loyalty/earn/mb.png';
import LGButton from '@/pages/components/common/buttons/LGButton';
import { throttle } from 'lodash';
import { Lottery } from '@/types/lottery';
import { LotteryRewardType, RewardQuality } from '@/constant/lottery';

interface Props extends ClassNameProps {
  onDrawed?: (item?: Lottery.RewardDTO) => void;
}

const DrawFooter: FC<Props & ItemProps<Lottery.Pool>> = ({ className, onDrawed, item }) => {
  const buttons = [
    {
      icon: 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/lottery/ticket_free.png',
      label: '1 Free Ticket',
      buttonLabel: 'Draw Once',
      times: 1,
    },
    {
      icon: mbImg,
      label: '75MBs',
      buttonLabel: 'Draw 3 Times',
      times: 3,
    },
    {
      icon: mbImg,
      label: '125MBs',
      buttonLabel: 'Draw 5 Times',
      times: 5,
    },
  ];
  const [loading, setLoading] = useState(false);

  const onDraw = throttle(async () => {
    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 500));

    setLoading(false);
    onDrawed?.({
      rewards: [
        {
          icon_url: 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/badges/lucky_draw_master/3.png',
          reward_type: LotteryRewardType.TICKET,
          reward_name: 'Lottery Ticket',
          reward_level: RewardQuality.GOLDEN,
          reward_claim_type: 0,
          amount: 2,
        },
      ],
    });
  }, 500);

  return (
    <div className={cn(['flex flex-col items-center', className])}>
      <div className="w-[42.6875rem] h-[7.125rem] relative">
        <Image
          className="object-contain"
          src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/lottery/card_discount.png"
          alt=""
          fill
          sizes="100%"
          unoptimized
        />
      </div>

      <div className="flex justify-between gap-x-28 mt-ten">
        {buttons.map((item, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className="flex justify-center items-center">
              <div className="w-[2.6875rem] h-[3.8125rem] relative">
                <Image className="object-contain" src={item.icon} alt="" fill sizes="100%" unoptimized />
              </div>

              <div className="font-semakin text-lg ml-3">{item.label}</div>
            </div>

            <LGButton label={item.buttonLabel} loading={loading} actived onClick={onDraw} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DrawFooter;
