import { useEffect, useState } from 'react';
import type { Props } from '.';
import { Lottery } from '@/types/lottery';

export interface UseTicketsProps {
  times: number;
  poolInfo?: Lottery.Pool | null;
  onFreeTicketChange?: (val: number) => void;
  onS1TicketChange?: (val: number) => void;
}

export function useTickets({ times, poolInfo, onFreeTicketChange, onS1TicketChange }: UseTicketsProps) {
  const isFreeTicketsEnough = (poolInfo?.user_free_lottery_ticket_amount || 0) >= times;
  const isS1TicketsEnough = (poolInfo?.user_s1_lottery_ticket_amount || 0) >= times;

  const freeInitCount = isFreeTicketsEnough ? times : 0;
  const s1InitCount = freeInitCount === 0 && isS1TicketsEnough ? times : 0;

  const [freeCount, setFreeCount] = useState(freeInitCount);
  const [s1Count, setS1Count] = useState(s1InitCount);

  const freeDisabled = s1Count >= times;
  const s1Disabled = isFreeTicketsEnough || (poolInfo?.user_s1_lottery_ticket_amount || 0) === 0;

  const [freeMaxCount, setFreeMaxCount] = useState(0);
  const [s1MaxCount, setS1MaxCount] = useState(0);

  function onChangeFree(val: number) {
    if (val === freeCount) return;
    setFreeCount(val);
    onFreeTicketChange?.(val);
  }

  function onChangeS1(val: number) {
    if (val === s1Count) return;
    setS1Count(val);
    onS1TicketChange?.(val);
  }

  useEffect(() => {
    onFreeTicketChange?.(freeCount);
    onS1TicketChange?.(s1Count);
  }, []);

  useEffect(() => {
    setFreeMaxCount(Math.max(times - s1Count, freeCount));
    setS1MaxCount(Math.min(poolInfo?.user_s1_lottery_ticket_amount || 0, times - freeCount));
  }, [s1Count, freeCount]);

  return [
    {
      label: 'Default Use',
      ticketLabel: 'Free TICKETS',
      iconURL: 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/lottery/ticket_free.png',
      count: freeCount,
      maxCount: freeMaxCount,
      disabled: freeDisabled,
      onMinus: () => onChangeFree(Math.max(freeCount - 1, 0)),
      onPlus: () => onChangeFree(Math.min(freeCount + 1, freeMaxCount)),
    },
    {
      label: 'Optional Use',
      ticketLabel: 'S1 TICKETS',
      iconURL: 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/lottery/ticket_s1.png',
      count: s1Count,
      maxCount: s1MaxCount,
      disabled: s1Disabled,
      onMinus: () => onChangeS1(Math.max(s1Count - 1, 0)),
      onPlus: () => onChangeS1(Math.min(s1Count + 1, s1MaxCount)),
    },
  ] as Props[];
}
