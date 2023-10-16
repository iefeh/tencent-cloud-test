'use client';

import { useRef, useState, useEffect, useLayoutEffect } from 'react';
import SwiperScreen from './components/home/SwiperScreen';
import Character from './components/character/character';
import Footer from './components/home/Footer';
import StarScreen from './components/home/StarScreen';
import Head from 'next/head';
import SloganScreen from './components/home/SloganScreen';
import SloganDescScreen from './components/home/SloganDescScreen';

export default function Home() {
  const scrollWrapper = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);
  const rafId = useRef(0);

  function setLuxyFixed() {
    if (!maskRef.current) return;

    const y = window.luxy.getWrapperTranslateY();
    const screenHeight = document.documentElement.clientHeight;
    const fs8 = (parseInt(document.documentElement.style.fontSize) || 16) * 8;
    maskRef.current.style.transform = `translate3d(0, ${screenHeight + fs8 - y * (1.3 + fs8 / screenHeight)}px, 0)`;
    rafId.current = requestAnimationFrame(setLuxyFixed);
  }

  function onLuxyScroll() {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    setScrollY(-scrollTop);
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
    <section
      ref={scrollWrapper}
      id="luxy"
      className="page-home scroll-wrapper relative w-full flex flex-col items-center justify-between bg-no-repeat bg-fixed bg-origin-border z-10"
    >
      <Head>
        <title>Home | Moonveil</title>
      </Head>

      <SwiperScreen />

      <div className="w-full h-screen overflow-hidden"></div>

      <SloganScreen scrollY={scrollY} />

      <SloganDescScreen />

      <div className="w-full overflow-hidden">
        <Character />
      </div>

      <Footer />

      <StarScreen />

      <div ref={maskRef} className="swiper-mask absolute left-0 top-0 w-full h-[130vh] translate-y-[100vh] z-20"></div>
    </section>
  );
}
