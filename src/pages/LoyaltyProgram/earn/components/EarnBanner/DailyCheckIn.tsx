import Image from 'next/image';
import dailyBgImg from 'img/loyalty/earn/bg_earn_banner_daily.jpg';
import dailyCheckInImg from 'img/loyalty/earn/daily_checkin.png';
import BasicButton from '@/pages/components/common/BasicButton';

export default function DailyCheckIn() {
  return (
    <div className="w-[42.5rem] h-[13.75rem] relative overflow-hidden rounded-[0.625rem] border-1 border-[#1D1D1D] flex flex-col justify-between pt-[3.0625rem] pb-[3.1875rem] px-[2.875rem]">
      <Image src={dailyBgImg} alt="" fill />

      <Image className="w-[9.5625rem] h-[2.6875rem] relative z-0" src={dailyCheckInImg} alt="" />

      <div className="flex items-center relative z-0">
        <BasicButton label="CHECK-IN" />

        <span className="text-sm font-poppins ml-4">
          <span className="text-basic-yellow">7 </span>
          consecutive days of check-ins completed.
        </span>
      </div>
    </div>
  );
}
