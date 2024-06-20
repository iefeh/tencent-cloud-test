'use client';

import { createRef, useEffect, useState } from 'react';
import AstrarkHome from './components/home';
import AstrArkSchool from './components/school';
import AstrArkSchoolDesc from './components/schoolDesc';
import WorldView from './components/worldView';
import SecondDesc from './components/secondDesc';
import Head from 'next/head';
import FloatRegisterButton from './components/FloatRegisterButton';

export default function Home() {
  const scrollWrapper = createRef<HTMLDivElement>();
  const [scrollY, setScrollY] = useState(0);

  function onLuxyScroll() {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    setScrollY(scrollTop);
  }

  useEffect(() => {
    window.addEventListener('scroll', onLuxyScroll);
    return () => window.removeEventListener('scroll', onLuxyScroll);
  }, []);

  return (
    <>
      <section ref={scrollWrapper} id="luxy" className="scroll-wrapper w-full relative flex flex-col z-10">
        <Head>
          <title>AstrArk | Moonveil Entertainment</title>
          <link rel="preload" as="image" href="/img/astrark/bg-home.jpg" crossOrigin="anonymous"></link>
        </Head>

        <div className="scroll-container flex flex-col z-10">
          <div className="w-full h-[200vh]"></div>

          <SecondDesc />

          <WorldView />

          <AstrArkSchool />

          <AstrArkSchoolDesc />
        </div>

        <FloatRegisterButton />
      </section>

      <AstrarkHome scrollY={scrollY} />
    </>
  );
}
