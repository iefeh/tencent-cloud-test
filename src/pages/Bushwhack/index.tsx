import Head from 'next/head';
import FogScreen from './subScreens/Fog';
import KeyVisionScreen from './subScreens/KeyVision';

export default function ProfilePage() {
  return (
    <section
      id="luxy"
      className="w-full flex flex-col mx-auto"
    >
      <Head>
        <title>Bushwhack | Moonveil Entertainment</title>
      </Head>

      <FogScreen />

      <KeyVisionScreen />
    </section>
  );
}
