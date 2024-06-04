import Image from 'next/image';
import earnMBsBgImg from 'img/profile/bg_earn_mbs.png';
import mbImg from 'img/loyalty/earn/mb.png';
import LGButton from '@/pages/components/common/buttons/LGButton';
import { useContext } from 'react';
import { MobxContext } from '@/pages/_app';
import { observer } from 'mobx-react-lite';
import { isMobile } from 'react-device-detect';
import { cn } from '@nextui-org/react';

function MoonBeams() {
  const { userInfo } = useContext(MobxContext);

  return (
    <div
      className={cn([
        'h-[13.75rem] relative overflow-hidden rounded-[0.625rem] border-1 border-[#1D1D1D] flex flex-col justify-between pt-[2.375rem] pb-[3.25rem] pl-[2.1875rem] hover:border-basic-yellow transition-[border-color] duration-500',
        isMobile ? 'w-full pr-[2.1875rem]' : 'w-[35rem] pr-[3.25rem]',
      ])}
    >
      <Image className="object-cover" src={earnMBsBgImg} alt="" fill />

      <div
        className={cn([
          'flex justify-between relative z-0 font-semakin text-basic-yellow',
          isMobile ? 'items-center' : 'items-start',
        ])}
      >
        <div className="flex items-center">
          <Image className="w-[2.625rem] h-[2.625rem]" src={mbImg} alt="" />
          <span className="text-2xl ml-[0.625rem] w-max">Moon Beams</span>
        </div>

        <div className="text-right">
          <div className="text-5xl">{userInfo?.moon_beam || '--'}</div>
        </div>
      </div>

      <div className={cn(['flex flex-wrap gap-[0.8125rem] items-center relative z-0', isMobile && 'mt-4'])}>
        <LGButton label="Earn more Moon Beams >>" link="/LoyaltyProgram/earn" />

        <LGButton label="Moon Beams History >>" actived link="/Profile/mbhistory" />
      </div>
    </div>
  );
}

export default observer(MoonBeams);
