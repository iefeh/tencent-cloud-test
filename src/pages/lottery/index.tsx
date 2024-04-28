import CoverScreen from '@/components/lottery/screens/CoverScreen';
import Head from 'next/head';
import { FC } from 'react';
import ScrollDownArrow from '../components/common/ScrollDownArrow';

const LotteryPage: FC = () => {
  return (
    <section className="w-full">
      <Head>
        <title>Lottery | Moonveil Entertainment</title>
      </Head>

      <CoverScreen />

      <ScrollDownArrow />
    </section>
  );
};

export default LotteryPage;
