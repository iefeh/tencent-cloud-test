import Image from 'next/image';
import earnMBsBgImg from 'img/profile/bg_earn_mbs.png';
import mbImg from 'img/loyalty/earn/mb.png';
import LGButton from '@/pages/components/common/LGButton';

export default function MoonBeams() {
  return (
    <div className="w-[42.5rem] h-[15rem] relative overflow-hidden rounded-[0.625rem] border-1 border-[#1D1D1D] flex flex-col justify-between pt-[2.375rem] pb-[3.25rem] pr-[10.5rem] pl-[2.1875rem] hover:border-basic-yellow transition-[border-color] duration-500">
      <Image src={earnMBsBgImg} alt="" fill />

      <div className="flex justify-between items-start relative z-0 font-semakin text-basic-yellow">
        <div className="flex items-center">
          <Image className="w-[2.625rem] h-[2.625rem]" src={mbImg} alt="" />
          <span className="text-2xl ml-[0.625rem]">Moon Beams</span>
        </div>

        <div className="text-right">
          <div className="text-5xl">2546</div>
          <div className="text-sm leading-none mt-[0.9375rem]">2546</div>
        </div>
      </div>

      <div className="flex items-center relative z-0">
        <LGButton className="mr-[0.8125rem]" label="Earn more Moon Beams >>" />
        <LGButton label="Moon Beams History >>" actived />
      </div>
    </div>
  );
}
