import { Lottery } from '@/types/lottery';
import { Tooltip, cn } from '@nextui-org/react';
import Image from 'next/image';
import { FC } from 'react';

const TicketsInfo: FC<ClassNameProps & ItemProps<Lottery.Pool>> = ({ className, item }) => {
  const tickets = [
    {
      icon: 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/lottery/ticket_free.png',
      label: 'Free Tickets',
      value: item?.user_free_lottery_ticket_amount || 0,
    },
    {
      icon: 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/lottery/ticket_s1.png',
      label: 'S1 Tickets',
      value: item?.user_s1_lottery_ticket_amount || 0,
    },
  ];

  return (
    <div
      className={cn(['w-[22.125rem] h-[4.5625rem] pl-2 pr-6', 'relative flex justify-between items-center', className])}
    >
      <Image
        src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/lottery/bg_tickets_info.png"
        alt=""
        fill
        sizes="100%"
        unoptimized
      />

      {tickets.map((item, index) => {
        const content = (
          <div key={index} className="flex items-center relative z-0">
            <div className="w-16 h-[5.625rem] relative">
              <Image className="object-contain" src={item.icon} alt="" fill sizes="100%" unoptimized />
            </div>

            <div className="font-semakin uppercase">
              <div className="text-[2rem] leading-none">{item.value.toString().padStart(2, '0')}</div>
              <div className="w-max">{item.label}</div>
            </div>
          </div>
        );

        if (index !== 1) return content;

        return (
          <Tooltip
            key={index}
            placement='bottom'
            content={
              <div className="max-w-[25rem]">
                <span className="text-basic-yellow">S1 Ticket</span> is a long-term valid ticket that can be used in multiple
                lottery pools. If you have already reached the maximum number of draws in this pool, you can save the
                ticket for future pools.
              </div>
            }
          >
            {content}
          </Tooltip>
        );
      })}
    </div>
  );
};

export default TicketsInfo;
