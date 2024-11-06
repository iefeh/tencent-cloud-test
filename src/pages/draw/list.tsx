import Head from 'next/head';
import { FC } from 'react';
import { observer } from 'mobx-react-lite';
import ShineBackground from '@/components/common/ShineBackground';
import MeteorLayer from '@/components/common/MeteorLayer';
import PoolListScreen from '@/components/pages/lottery/screens/PoolListScreen';

const LotteryListPage: FC = () => {
  return (
    <>
      <section
        className="w-full bg-[url('https://d3dhz6pjw7pz9d.cloudfront.net/lottery/bg.png')] bg-[length:100%_auto] bg-no-repeat relative"
        id="luxy"
      >
        <Head>
          <title>Draw | Moonveil Entertainment</title>
        </Head>

        <ShineBackground />

        <MeteorLayer className="z-10" />

        <PoolListScreen />
      </section>
    </>
  );
};

export default observer(LotteryListPage);
