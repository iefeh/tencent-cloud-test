import Image from 'next/image';
import logoImg from 'img/bushwhack/countdown/logo.png';
import ScrollDownArrow from '@/pages/components/common/ScrollDownArrow';
import arrowImg from 'img/bushwhack/countdown/arrow.png';
import fogImg from 'img/bushwhack/countdown/fog.png';
import PageDesc from '@/components/common/PageDesc';
import { createPortal } from 'react-dom';
import useTouchBottom from '@/hooks/useTouchBottom';
import { cn } from '@nextui-org/react';
import PreRegisterButton from '@/components/common/buttons/PreregisterButton';
import BrPreInfo from './BrPreInfo';

export default function CountdownScreen() {
  const { isTouchedBottom } = useTouchBottom();

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center relative z-30 shadow-[0_0_2rem_2rem_#000] px-16 lg:px-0">
      <Image className="object-cover z-[-1] opacity-25" src={fogImg} alt="" fill />
      <PageDesc
        needAni
        baseAniTY
        title={
          <div className="-mt-7 flex flex-col items-center">
            <Image className="w-[20.875rem] h-[12.625rem]" src={logoImg} alt="" />
            <div className="mt-8 lg:mt-2 font-semakin leading-none lg:leading-normal text-[5.625rem] text-transparent bg-clip-text bg-gradient-to-b from-[#3C6EFF] via-[#B6DCFF] via-[49.7314453125%] to-[#3E70FF]">
              Coming Soon...
            </div>
          </div>
        }
        subtitle={
          <div className="m-[0.125rem] font-poppins-medium text-white text-base max-w-[33.5rem] text-center">
            Explore the mist, unveil hidden mysteries in the bush, and immerse yourself in exhilarating gaming
            adventures
          </div>
        }
        button={<BrPreInfo />}
      />

      {createPortal(
        <ScrollDownArrow icon={arrowImg} className={cn(['!fixed !text-[#CFD9FF]', isTouchedBottom && 'hidden'])} />,
        document.body,
      )}
    </div>
  );
}
