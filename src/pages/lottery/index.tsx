import CoverScreen from '@/components/pages/lottery/screens/CoverScreen';
import Head from 'next/head';
import { FC, useRef } from 'react';
import ScrollDownArrow from '../components/common/ScrollDownArrow';
import DrawScreen from '@/components/pages/lottery/screens/DrawScreen';
import { createPortal } from 'react-dom';
import BadgeScreen from '@/components/pages/lottery/screens/BadgeScreen';
import usePrizePool from '@/components/pages/lottery/hooks/usePrizePool';
import { useUserContext } from '@/store/User';
import { observer } from 'mobx-react-lite';
import useTouchBottom from '@/hooks/useTouchBottom';
import ShineBackground from '@/components/common/ShineBackground';
import MeteorLayer from '@/components/common/MeteorLayer';

const LotteryPage: FC = () => {
  const { getUserInfo } = useUserContext();
  const { poolInfo, queryPoolInfo, ended } = usePrizePool();
  const { isTouchedBottom } = useTouchBottom();
  const badgeScreenRef = useRef<UpdateForwardRenderFunction>(null);

  function onUpdate() {
    queryPoolInfo();
    getUserInfo();
    badgeScreenRef.current?.update();
  }

  return (
    <>
      <section
        className="w-full bg-[url('https://moonveil-public.s3.ap-southeast-2.amazonaws.com/lottery/bg.png')] bg-[length:100%_auto] bg-no-repeat relative"
        id="luxy"
      >
        <Head>
          <title>Lottery | Moonveil Entertainment</title>
        </Head>

        <ShineBackground />

        <MeteorLayer className="z-10" />

        <CoverScreen />

        <DrawScreen ended={ended} item={poolInfo} onUpdate={onUpdate} />

        <BadgeScreen ref={badgeScreenRef} item={poolInfo} />

        {isTouchedBottom || createPortal(<ScrollDownArrow className="!fixed" />, document.body)}
      </section>
    </>
  );
};

export default observer(LotteryPage);
