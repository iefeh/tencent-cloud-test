import Head from 'next/head';
import BreathBackground from './components/BreathBackground';
import IndexScreen from './components/IndexScreen';
import TrifleScren from './components/TrifleScreen';
import PrivilegeScreen from './components/PrivilegeScreen';
import Footer from '../components/home/Footer';

export default function NFT() {
  return (
    <>
      <section id="luxy" className="w-full flex flex-col z-10">
        <Head>
          <title>NFT | Moonveil</title>
        </Head>

        <div className="page-container w-full">
          <IndexScreen />

          <TrifleScren />

          <PrivilegeScreen />

          <Footer />
        </div>
      </section>

      <BreathBackground />
    </>
  );
}
