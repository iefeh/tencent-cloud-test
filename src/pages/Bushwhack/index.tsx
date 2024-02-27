import Head from 'next/head';
import KeyVisionScreen from './subScreens/KeyVision';
import IntroScreen from './subScreens/Intro';
import CountdownScreen from './subScreens/Countdown';
import { useEffect, useRef, useState } from 'react';
import GameContent from './subScreens/GameContent';
import FogScreen from './subScreens/Fog';
import FogDeco from './subScreens/components/FogDeco';
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
