import Head from 'next/head';
import FogScreen from './subScreens/Fog';
import KeyVisionScreen from './subScreens/KeyVision';
import IntroScreen from './subScreens/Intro';
import CountdownScreen from './subScreens/Countdown';

export default function BushwhackPage() {
  return (
    <section
      id="luxy"
      className="w-full flex flex-col mx-auto"
    >
      <Head>
        <title>Bushwhack | Moonveil Entertainment</title>
      </Head>

      <CountdownScreen />

      <FogScreen />

      {/* <KeyVisionScreen />

      <IntroScreen /> */}
    </section>
  );
}
