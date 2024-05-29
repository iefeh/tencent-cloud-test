import { Lottery } from '@/types/lottery';
import { to2Digit } from '@/utils/common';
import { cn } from '@nextui-org/react';
import Image from 'next/image';
import { FC } from 'react';
import { useTickets, UseTicketsProps } from './useTickets';

export interface Props {
  label: string;
  ticketLabel: string;
  iconURL: string;
  count?: number;
  maxCount?: number;
  disabled?: boolean;
  onMinus?: () => void;
  onPlus?: () => void;
}

const TicketContent: FC<Props> = ({ label, ticketLabel, iconURL, count, maxCount, disabled, onMinus, onPlus }) => {
  return (
    <div className="flex justify-between items-center w-full mt-7 font-semakin relative">
      <div className="text-2xl">{label}</div>

      <div className="w-[29.6875rem] h-[5.875rem] relative flex items-center justify-between pl-2 pr-4">
        <Image
          src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/lottery/bg_mb_info.png"
          alt=""
          fill
          sizes="100%"
          unoptimized
        />

        <Image
          className="w-16 h-[5.625rem] object-contain relative z-0"
          src={iconURL}
          alt=""
          width={3507}
          height={4960}
          unoptimized
        />

        <div className="text-sm relative z-0 flex-1 text-left">{ticketLabel}</div>

        <Image
          className={cn([
            'w-[1.125rem] h-[1.125rem] object-contain mr-3 relative z-0',
            disabled ? 'cursor-not-allowed' : 'cursor-pointer',
          ])}
          src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/common/icon_minus_basic_yellow.png"
          alt=""
          width={38}
          height={6}
          unoptimized
          onClick={onMinus}
        />

        <div className="w-[9.625rem] h-14 relative flex justify-center items-center z-0">
          <Image
            src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/lottery/bg_draw_button.png"
            alt=""
            fill
            sizes="100%"
            unoptimized
          />

          <div className="font-semakin text-2xl">
            {to2Digit(count || 0)}/{to2Digit(maxCount || 0)}
          </div>
        </div>

        <Image
          className={cn([
            'w-[1.125rem] h-[1.125rem] object-contain ml-3 relative z-0',
            disabled ? 'cursor-not-allowed' : 'cursor-pointer',
          ])}
          src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/common/icon_plus_basic_yellow.png"
          alt=""
          width={38}
          height={6}
          unoptimized
          onClick={onPlus}
        />
      </div>

      {disabled && <div className="absolute w-full h-full bg-black/70 z-10"></div>}
    </div>
  );
};

export default TicketContent;

export const TicketContents: FC<UseTicketsProps> = (props) => {
  const [freeProps, s1Props] = useTickets(props);

  return (
    <>
      <TicketContent {...freeProps} />
      <TicketContent {...s1Props} />
    </>
  );
};
