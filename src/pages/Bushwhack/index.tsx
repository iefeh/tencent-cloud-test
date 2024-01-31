import Head from 'next/head';
import FogScreen from './subScreens/Fog';
import KeyVisionScreen from './subScreens/KeyVision';
import IntroScreen from './subScreens/Intro';
import CountdownScreen from './subScreens/Countdown';
import { useEffect, useRef } from 'react';
import GameContent from './subScreens/GameContent';
import SuperFogScreen from './subScreens/SuperFog';

export default function BushwhackPage() {
  const scrollWrapper = useRef<HTMLDivElement>(null);

  function onLuxyScroll() {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const y = window.luxy.getWrapperTranslateY();
    const screenHeight = window.innerHeight;
    if (y < screenHeight && scrollTop > screenHeight) {
      document.documentElement.scrollTo(0, screenHeight);
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

      {/* <FogScreen /> */}
      <SuperFogScreen />

      {/* <KeyVisionScreen /> */}

      <GameContent />

      <IntroScreen />
    </section>
  );
}
