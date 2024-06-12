import Head from 'next/head';
import KeyVisionScreen from '@/components/pages/bushwhack/home/KeyVision';
import IntroScreen from '@/components/pages/bushwhack/home/Intro';
import CountdownScreen from '@/components/pages/bushwhack/home/Countdown';
import { useEffect, useRef, useState } from 'react';
import GameContent from '@/components/pages/bushwhack/home/GameContent';
import FogScreen from '@/components/pages/bushwhack/home/Fog';
import FogDeco from '@/components/pages/bushwhack/home/components/FogDeco';
import { throttle } from 'lodash';

export default function BushwhackPage() {
  const scrollWrapper = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const [touchedTarget, setTouchedTarget] = useState(false);

  const onLuxyScroll = throttle(() => {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const screenHeight = window.innerHeight;

    if (
      (lastScrollY.current < screenHeight && scrollTop > screenHeight) ||
      (lastScrollY.current > screenHeight && scrollTop < screenHeight) ||
      Math.abs(scrollTop - screenHeight) < 50
    ) {
      document.documentElement.scrollTo(0, screenHeight);
      lastScrollY.current = screenHeight;
    } else {
      lastScrollY.current = scrollTop;
    }

    setTouchedTarget(lastScrollY.current === screenHeight);
  }, 300);

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

      <FogDeco />

      <FogScreen touched={touchedTarget} />

      {/* <KeyVisionScreen /> */}

      <GameContent />

      <IntroScreen />
    </section>
  );
}
