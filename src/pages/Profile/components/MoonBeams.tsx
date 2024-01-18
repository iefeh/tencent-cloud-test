import Image from 'next/image';
import earnMBsBgImg from 'img/profile/bg_earn_mbs.png';
import mbImg from 'img/loyalty/earn/mb.png';
import LGButton from '@/pages/components/common/buttons/LGButton';
import MBHistoryButton from './MBHistoryButton';
import { useContext } from 'react';
import { MobxContext } from '@/pages/_app';

export default function MoonBeams() {
  const {userInfo} = useContext(MobxContext);

  return (
    <div className="w-[42.5rem] h-[15rem] relative overflow-hidden rounded-[0.625rem] border-1 border-[#1D1D1D] flex flex-col justify-between pt-[2.375rem] pb-[3.25rem] pr-[10.5rem] pl-[2.1875rem] hover:border-basic-yellow transition-[border-color] duration-500">
      <Image className="object-cover" src={earnMBsBgImg} alt="" fill />

      <div className="flex justify-between items-start relative z-0 font-semakin text-basic-yellow">
        <div className="flex items-center">
          <Image className="w-[2.625rem] h-[2.625rem]" src={mbImg} alt="" />
          <span className="text-2xl ml-[0.625rem]">Moon Beams</span>
        </div>

        <div className="text-right">
          <div className="text-5xl">{userInfo?.moon_beam || '--'}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-[0.8125rem] items-center relative z-0">
        <LGButton label="Earn more Moon Beams >>" link="/LoyaltyProgram/earn" />
        <MBHistoryButton />
      </div>
    </div>
  );
}
