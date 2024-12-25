import S3Image from "@/components/common/medias/S3Image";
import useCountdown from '@/hooks/useCountdown';
import dayjs from 'dayjs';
import reverifyTipImg from 'img/loyalty/earn/reverify_tip.png';
import { useState } from "react";

const EventTaskCountDown = ({ durationTime, updateTasks }: { durationTime: number; updateTasks?: () => void }) => {
  const now = Date.now();
  const [leftText, setLeftText] = useState('--:--:--');

  useCountdown(now + durationTime, now, (time) => {
    const du = dayjs.duration(time);
    setLeftText(Math.floor(du.asHours()) + du.format(':mm:ss'));

    if (time <= 0) {
      updateTasks?.();
    }
  });

  return (
    <div className="border-2 border-[#DAAC74] rounded-[0.625rem] bg-[#070707] flex justify-between px-4 py-2">
      <S3Image className="w-[1.125rem] h-[1.125rem]" src={reverifyTipImg} />
      <div className="font-poppins text-sm text-[#999] ml-[0.8125rem]">
        Task will start in <span className="text-[#DAAC74]">{leftText}</span>.
      </div>
    </div>
  );
};

export default EventTaskCountDown;
