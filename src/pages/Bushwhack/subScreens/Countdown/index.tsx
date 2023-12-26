import Image from 'next/image';
import logoImg from 'img/bushwhack/countdown/logo.png';
import ScrollDownArrow from '@/pages/components/common/ScrollDownArrow';
import arrowImg from 'img/bushwhack/countdown/arrow.png';
import fogImg from 'img/bushwhack/countdown/fog.png';
import PageDesc from '@/pages/components/common/PageDesc';

export default function CountdownScreen() {
  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center relative">
      <Image className="object-cover z-[-1] opacity-25" src={fogImg} alt="" fill />

      <Image className="w-[15.1875rem] h-[15.375rem] -mt-7" src={logoImg} alt="" />

      <PageDesc
        needAni
        baseAniTY
        title={
          <div className="mt-2 font-semakin text-[5.625rem] text-transparent bg-clip-text bg-gradient-to-b from-[#3C6EFF] via-[#B6DCFF] via-[49.7314453125%] to-[#3E70FF]">
            in 9 days…
          </div>
        }
        subtitle={
          <div className="m-[0.125rem] font-poppins-medium text-white text-base max-w-[33.5rem] text-center">
            Explore the mist, unveil hidden mysteries in the bush, and immerse yourself in exhilarating gaming
            adventures
          </div>
        }
      />

      <ScrollDownArrow icon={arrowImg} className="!text-[#CFD9FF]" />
    </div>
  );
}
