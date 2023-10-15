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
  const [scrollY, setScrollY] = useState(0);
  const isFixed = useRef(true);
  const rafId = useRef(0);

  function onMaskAniEnd() {
    if (!scrollWrapper.current || !window.luxy) return;

    window.luxy.disable();
    isFixed.current = false;
    const y = document.documentElement.clientHeight;
    document.documentElement.scrollTo(0, y);
    scrollWrapper.current.style.transform = `translate3d(0px, -${y}px, 0px)`;
    window.luxy.enable();
  }

  function setLuxyFixed() {
    const y = window.luxy.getWrapperTranslateY();
    if (y === 0) {
      isFixed.current = true;
      return;
    }

    rafId.current = requestAnimationFrame(setLuxyFixed);
  }

  function onLuxyScroll() {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    setScrollY(-scrollTop);
    if (scrollTop === 0 && !isFixed.current) {
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

      <SwiperScreen scrollY={scrollY} isFixed={isFixed} parent={scrollWrapper} onMaskAniEnd={onMaskAniEnd} />

      <div className="w-full h-screen overflow-hidden"></div>

      <SloganScreen scrollY={scrollY} />

      <SloganDescScreen />

      <div className="w-full overflow-hidden">
        <Character />
      </div>

      <Footer />

      <StarScreen />
    </section>
  );
}
