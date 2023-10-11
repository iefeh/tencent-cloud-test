'use client';

import { createRef, useRef } from 'react';
import AstrarkHome from './components/home';
import AstrArkSchool from './components/school';
import AstrArkSchoolDesc from './components/schoolDesc';
import WorldView from './components/worldView';
import SecondDesc from './components/secondDesc';
import Head from 'next/head';
import Scrollbar from 'smooth-scrollbar';

export default function Home() {
  const scrollWrapper = createRef<HTMLDivElement>();
  const sbRef = useRef<Scrollbar>();

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
    scrollbar.addListener(status => {
      if (status.offset.y > 0) return;

      destroyScroll();
    })
    sbRef.current = scrollbar;
  }

  function onScrollStatusChange(enable: boolean) {
    if (enable && !sbRef.current) {
      initScroll();
    } else if (!enable && sbRef.current) {
      destroyScroll();
    }
  }

  return (
    <section ref={scrollWrapper} className="scroll-wrapper w-full h-screen overflow-hidden">
      <Head>
        <title>AstrArk | Moonveil</title>
      </Head>

      <div className="scroll-container">
        <AstrarkHome onScrollStatusChange={onScrollStatusChange} />

        <SecondDesc />

        <WorldView />

        <AstrArkSchool />

        <AstrArkSchoolDesc />
      </div>
    </section>
  );
}
