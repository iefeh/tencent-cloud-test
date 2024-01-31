import Image from 'next/image';
import logoImg from 'img/bushwhack/countdown/logo.png';
import ScrollDownArrow from '@/pages/components/common/ScrollDownArrow';
import arrowImg from 'img/bushwhack/countdown/arrow.png';
import fogImg from 'img/bushwhack/countdown/fog.png';
import PageDesc from '@/pages/components/common/PageDesc';
import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';

export default function CountdownScreen() {
  const [isTouchBottom, setIsTouchBottom] = useState(false);

  function onScroll() {
    const scrollY = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
    const clientHeight = document.documentElement.clientHeight || document.body.clientHeight;
    setIsTouchBottom(scrollY >= scrollHeight - clientHeight);
  }

  useEffect(() => {
    window.addEventListener('scroll', onScroll);

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center relative">
      <Image className="object-cover z-[-1] opacity-25" src={fogImg} alt="" fill />

      <PageDesc
        needAni
        baseAniTY
        title={
          <div className="-mt-7 flex flex-col items-center">
            <Image className="w-[20.875rem] h-[12.625rem]" src={logoImg} alt="" />
            <div className="mt-2 font-semakin text-[5.625rem] text-transparent bg-clip-text bg-gradient-to-b from-[#3C6EFF] via-[#B6DCFF] via-[49.7314453125%] to-[#3E70FF]">
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
      />

      {isTouchBottom ||
        createPortal(<ScrollDownArrow icon={arrowImg} className="!fixed !text-[#CFD9FF]" />, document.body)}
    </div>
  );
}
