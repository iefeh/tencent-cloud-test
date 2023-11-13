import Image from 'next/image';
import triangleImg from 'img/nft/breathBg/triangle.png';
import breathImg from 'img/nft/breathBg/breath.png';
import styles from './index.module.css';
import { useEffect, useRef, useState } from 'react';

export default function BreathBackground() {
  const rafId = useRef(0);
  const bgRef = useRef<HTMLDivElement>(null);

  function runAni() {
    const y = window.luxy.getWrapperTranslateY();
    const screenHeight = document.documentElement.clientHeight;
    if (y > screenHeight && y < screenHeight * 2 && bgRef.current) {
      bgRef.current.style.top = screenHeight - y + 'px';
    }

    rafId.current = requestAnimationFrame(runAni);
  }

  useEffect(() => {
    if (rafId.current > 0) cancelAnimationFrame(rafId.current);
    runAni();

    return () => {
      if (rafId.current > 0) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <div ref={bgRef} className="fixed w-screen h-screen left-0 top-0 z-0 flex justify-center items-center">
      <Image className="w-[44.875rem] h-[41.5rem]" src={triangleImg} alt="" />
      <Image
        className={'w-[120rem] absolute left-0 top-[61.5%] origin-center border border-[rgba(255,216,178,0.2)] rounded-full ' + styles.breath}
        src={breathImg}
        alt=""
      />
    </div>
  );
}
