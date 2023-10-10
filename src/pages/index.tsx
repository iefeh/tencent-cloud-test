'use client';

import { createRef, useRef, useState } from 'react';
import SwiperScreen from './components/home/SwiperScreen';
import Character from './components/character/character';
import Footer from './components/home/Footer';
import StarScreen from './components/home/StarScreen';
import Head from 'next/head';
import Scrollbar from 'smooth-scrollbar';
import SloganScreen from './components/home/SloganScreen';
import SloganDescScreen from './components/home/SloganDescScreen';

export default function Home() {
  const scrollWrapper = createRef<HTMLDivElement>();
  const sbRef = useRef<Scrollbar>();
  const [scrollY, setScrollY] = useState(0);

  function destroyScroll() {
    if (!scrollWrapper.current) return;
    Scrollbar.destroy(scrollWrapper.current);
    sbRef.current = undefined;
  }

  function initScroll() {
    destroyScroll();

    const scrollbar = Scrollbar.init(scrollWrapper.current!, { thumbMinSize: 0, damping: 1 });
    scrollbar.track.xAxis.element.remove();
    scrollbar.track.yAxis.element.remove();
    scrollbar.addListener((status) => {
      setScrollY(status.offset.y || 0);
      if (status.offset.y > 0) return;

      destroyScroll();
    });
    scrollbar.scrollTo(0, document.documentElement.clientHeight);
    sbRef.current = scrollbar;
  }

  function onMaskAniEnd() {
    initScroll();
  }

  return (
    <section
      ref={scrollWrapper}
      className="page-home scroll-wrapper relative w-full h-screen flex flex-col items-center justify-between overflow-hidden bg-no-repeat bg-fixed bg-origin-border"
    >
      <Head>
        <title>Home | Moonveil</title>
      </Head>

      <div className="scroll-container w-full relative">
        <SwiperScreen onMaskAniEnd={onMaskAniEnd} />

        <SloganScreen />

        <SloganDescScreen />

        <div className="overflow-hidden">
          <Character />
        </div>

        <Footer />
      </div>

      {scrollY > 0 && <StarScreen />}
    </section>
  );
}
