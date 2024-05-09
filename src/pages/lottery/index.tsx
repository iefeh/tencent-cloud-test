import CoverScreen from '@/components/lottery/screens/CoverScreen';
import Head from 'next/head';
import { FC } from 'react';
import ScrollDownArrow from '../components/common/ScrollDownArrow';
import DrawScreen from '@/components/lottery/screens/DrawScreen';
import { createPortal } from 'react-dom';

const LotteryPage: FC = () => {
  return (
    <section className="w-full">
      <Head>
        <title>Lottery | Moonveil Entertainment</title>
      </Head>

      <CoverScreen />

      <DrawScreen />

      {createPortal(<ScrollDownArrow className="!fixed" />, document.body)}
    </section>
  );
};

export default LotteryPage;
