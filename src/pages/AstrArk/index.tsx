'use client';

import { createRef, useLayoutEffect, useRef, useState } from 'react';
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
  const [scrollY, setScrollY] = useState(0);

  function destroyScroll() {
    if (!scrollWrapper.current) return;
    Scrollbar.destroy(scrollWrapper.current);
    sbRef.current = undefined;
  }

  useLayoutEffect(() => {
    const scrollbar = Scrollbar.init(scrollWrapper.current!, { thumbMinSize: 0, damping: 1 });
    scrollbar.track.xAxis.element.remove();
    scrollbar.track.yAxis.element.remove();
    scrollbar.addListener((status) => {
      setScrollY(status.offset.y || 0);
    });
    sbRef.current = scrollbar;

    return () => destroyScroll();
  }, []);

  return (
    <section ref={scrollWrapper} className="scroll-wrapper w-full h-screen overflow-hidden relative">
      <Head>
        <title>AstrArk | Moonveil</title>
      </Head>

      <AstrarkHome scrollY={scrollY} />

      <div className="scroll-container flex flex-col z-10">
        <div className="w-full h-[200vh]"></div>

        <SecondDesc scrollY={scrollY} />

        <WorldView />

        <AstrArkSchool />

        <AstrArkSchoolDesc />
      </div>
    </section>
  );
}
