import CoverScreen from '@/components/pages/lottery/screens/CoverScreen';
import Head from 'next/head';
import { FC, useRef } from 'react';
import ScrollDownArrow from '../components/common/ScrollDownArrow';
import { createPortal } from 'react-dom';
import BadgeScreen from '@/components/pages/lottery/screens/BadgeScreen';
import { observer } from 'mobx-react-lite';
import useTouchBottom from '@/hooks/useTouchBottom';
import ShineBackground from '@/components/common/ShineBackground';
import MeteorLayer from '@/components/common/MeteorLayer';
import PoolsScreen from '@/components/pages/lottery/screens/PoolsScreen';

const LotteryPage: FC = () => {
  const { isTouchedBottom } = useTouchBottom();
  const badgeScreenRef = useRef<UpdateForwardRenderFunction>(null);

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

        <CoverScreen />

        <PoolsScreen />

        <BadgeScreen ref={badgeScreenRef} />

        {isTouchedBottom || createPortal(<ScrollDownArrow className="!fixed" />, document.body)}
      </section>
    </>
  );
};

export default observer(LotteryPage);
