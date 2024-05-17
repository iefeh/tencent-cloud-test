import CoverScreen from '@/components/lottery/screens/CoverScreen';
import Head from 'next/head';
import { FC } from 'react';
import ScrollDownArrow from '../components/common/ScrollDownArrow';
import DrawScreen from '@/components/lottery/screens/DrawScreen';
import { createPortal } from 'react-dom';
import BadgeScreen from '@/components/lottery/screens/BadgeScreen';

const LotteryPage: FC = () => {
  return (
    <section
      className="w-full bg-[url('https://moonveil-public.s3.ap-southeast-2.amazonaws.com/lottery/bg.png')] bg-[length:100%_auto] bg-no-repeat"
      id="luxy"
    >
      <Head>
        <title>Lottery | Moonveil Entertainment</title>
      </Head>

      <CoverScreen />

      <DrawScreen />

      <BadgeScreen />

      {createPortal(<ScrollDownArrow className="!fixed" />, document.body)}
    </section>
  );
};

export default LotteryPage;
