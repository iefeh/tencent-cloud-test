import Head from 'next/head';
import { FC, useRef } from 'react';
import DrawScreen from '@/components/pages/lottery/screens/DrawScreen';
import usePrizePool from '@/components/pages/lottery/hooks/usePrizePool';
import { useUserContext } from '@/store/User';
import { observer } from 'mobx-react-lite';
import ShineBackground from '@/components/common/ShineBackground';
import MeteorLayer from '@/components/common/MeteorLayer';

const LotteryPage: FC = () => {
  const { getUserInfo } = useUserContext();
  const { poolInfo, queryPoolInfo, ended } = usePrizePool();
  const badgeScreenRef = useRef<UpdateForwardRenderFunction>(null);

  function onUpdate() {
    queryPoolInfo();
    getUserInfo();
    badgeScreenRef.current?.update();
  }

  return (
    <>
      <section
        className="w-full bg-[url('https://moonveil-public.s3.ap-southeast-2.amazonaws.com/lottery/bg.png')] bg-[length:100%_auto] bg-no-repeat relative pt-36 lg:pt-0"
        id="luxy"
      >
        <Head>
          <title>Lottery | Moonveil Entertainment</title>
        </Head>

        <ShineBackground />

        <MeteorLayer className="z-10" />

        <DrawScreen ended={ended} item={poolInfo} onUpdate={onUpdate} />
      </section>
    </>
  );
};

export default observer(LotteryPage);
