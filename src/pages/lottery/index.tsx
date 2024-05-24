import CoverScreen from '@/components/lottery/screens/CoverScreen';
import Head from 'next/head';
import { FC, useRef } from 'react';
import ScrollDownArrow from '../components/common/ScrollDownArrow';
import DrawScreen from '@/components/lottery/screens/DrawScreen';
import { createPortal } from 'react-dom';
import BadgeScreen from '@/components/lottery/screens/BadgeScreen';
import usePrizePool from '@/components/lottery/hooks/usePrizePool';
import { useUserContext } from '@/store/User';
import { observer } from 'mobx-react-lite';
import useTouchBottom from '@/hooks/useTouchBottom';

const LotteryPage: FC = () => {
  const { poolInfo, queryPoolInfo } = usePrizePool();
  const { isTouchedBottom } = useTouchBottom();
  const badgeScreenRef = useRef<UpdateForwardRenderFunction>(null);

  function onUpdate() {
    queryPoolInfo();
    badgeScreenRef.current?.update();
  }

  return (
    <section
      className="w-full bg-[url('https://moonveil-public.s3.ap-southeast-2.amazonaws.com/lottery/bg.png')] bg-[length:100%_auto] bg-no-repeat"
      id="luxy"
    >
      <Head>
        <title>Lottery | Moonveil Entertainment</title>
      </Head>

      <CoverScreen />

      <DrawScreen item={poolInfo} onUpdate={onUpdate} />

      <BadgeScreen ref={badgeScreenRef} item={poolInfo} />

      {isTouchedBottom || createPortal(<ScrollDownArrow className="!fixed" />, document.body)}
    </section>
  );
};

export default observer(LotteryPage);
