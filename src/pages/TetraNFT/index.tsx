import Head from 'next/head';
import BreathBackground from './components/BreathBackground';
import IndexScreen from './components/IndexScreen';
import TrifleScren from './components/TrifleScreen';
import PrivilegeScreen from './components/PrivilegeScreen';
import Footer from '@/components/pages/home/Footer';
import MainTitle from './components/IndexScreen/MainTitle';

export default function TetraNFT() {
  return (
    <>
      <section id="luxy" className="w-full flex flex-col z-10">
        <Head>
          <title>NFT | Moonveil Entertainment</title>
        </Head>

        <div className="page-container w-full px-16 lg:px-0">
          <IndexScreen />

          <TrifleScren />

          <PrivilegeScreen />

          <Footer />
        </div>
      </section>

      <BreathBackground />
      <MainTitle />
    </>
  );
}
