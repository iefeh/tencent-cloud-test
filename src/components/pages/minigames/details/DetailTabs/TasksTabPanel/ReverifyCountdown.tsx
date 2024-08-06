import useCountdown from '@/hooks/useCountdown';
import type { TaskItem } from '@/types/quest';
import dayjs from 'dayjs';
import Image from 'next/image';
import { FC, useState } from 'react';
import reverifyTipImg from 'img/loyalty/earn/reverify_tip.png';

interface Props {
  task: TaskItem;
  onFinished?: () => void;
}

const ReverifyCountdown: FC<Props> = ({ task: { properties }, onFinished }) => {
  const { can_reverify_after } = properties || {};
  const [cdText, setCdText] = useState('');

  useCountdown(can_reverify_after || 0, 0, (leftTime) => {
    const du = dayjs.duration(leftTime);
    setCdText(du.format('HH:mm:ss'));

    if (leftTime <= 0) {
      onFinished?.();
    }
  });

  return (
    <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-[25.75rem] h-[5.625rem] border-2 border-[#DAAC74] rounded-[0.625rem] bg-[#070707] flex justify-between pt-[1.375rem] pl-[1.0625rem]">
      <Image className="w-[1.125rem] h-[1.125rem]" src={reverifyTipImg} alt="" />
      <div className="font-poppins text-sm text-[#999] ml-[0.8125rem]">
        If your wallet assets have increased, you can reverify your assets in{' '}
        <span className="text-[#DAAC74]">{cdText}</span> to earn more MBs.
      </div>
    </div>
  );
};

export default ReverifyCountdown;
