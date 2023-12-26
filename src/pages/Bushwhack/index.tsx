import Head from 'next/head';
import FogScreen from './subScreens/Fog';
import KeyVisionScreen from './subScreens/KeyVision';
import IntroScreen from './subScreens/Intro';
import CountdownScreen from './subScreens/Countdown';
import { useEffect, useRef, useState } from 'react';

export default function BushwhackPage() {
  const scrollWrapper = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const rafId = useRef(0);

  function setLuxyFixed() {
    if (!maskRef.current) return;

    const y = window.luxy.getWrapperTranslateY();
    const screenHeight = document.documentElement.clientHeight;
    const fs8 = (parseInt(document.documentElement.style.fontSize) || 16) * 8;
    maskRef.current.style.transform = `translate3d(0, ${screenHeight + fs8 - y * (0.6 + fs8 / screenHeight)}px, 0)`;
    rafId.current = requestAnimationFrame(setLuxyFixed);
  }

  function onLuxyScroll() {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    if (scrollTop > 0) {
      if (rafId.current > 0) cancelAnimationFrame(rafId.current);
      setLuxyFixed();
    }
  }

  useEffect(() => {
    window.addEventListener('scroll', onLuxyScroll);
    return () => window.removeEventListener('scroll', onLuxyScroll);
  }, []);

  return (
    <section ref={scrollWrapper} id="luxy" className="w-full flex flex-col mx-auto relative">
      <Head>
        <title>Bushwhack | Moonveil Entertainment</title>
      </Head>

      <CountdownScreen />

      <div className="w-full h-[10vh] overflow-hidden"></div>

      <FogScreen />

      {/* <KeyVisionScreen />

      <IntroScreen /> */}

      <div
        ref={maskRef}
        className="swiper-mask absolute left-0 top-0 w-full h-[60vh] translate-y-[calc(100vh_+_8rem)] z-20 bg-black shadow-[0_0_8rem_8rem_#000]"
      ></div>
    </section>
  );
}
