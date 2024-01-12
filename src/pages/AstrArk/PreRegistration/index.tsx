import IndexScreen from './subScreens/IndexScreen';
import Head from 'next/head';
import KVScreen from './subScreens/KVScreen';
import FeatureScreen from './subScreens/FeatureScreen';

export default function PreRegistrationPage() {
  return (
    <>
      <section id="luxy" className="scroll-wrapper w-full relative flex flex-col z-10">
        <Head>
          <title>Pre-Registration | Moonveil Entertainment</title>
        </Head>

        <IndexScreen />

        <KVScreen />

        <FeatureScreen />
      </section>
    </>
  );
}
