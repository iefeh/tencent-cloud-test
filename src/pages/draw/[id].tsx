import Head from 'next/head';
import { FC, useRef } from 'react';
import DrawScreen from '@/components/pages/lottery/screens/DrawScreen';
import usePrizePool from '@/components/pages/lottery/hooks/usePrizePool';
import { useUserContext } from '@/store/User';
import { observer } from 'mobx-react-lite';
import ShineBackground from '@/components/common/ShineBackground';
import MeteorLayer from '@/components/common/MeteorLayer';
import RulesScreen from '@/components/pages/lottery/screens/RulesScreen';

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
        className="w-full bg-[url('https://d3dhz6pjw7pz9d.cloudfront.net/lottery/bg.png')] bg-[length:100%_auto] bg-no-repeat relative pt-36 lg:pt-0"
        id="luxy"
      >
        <Head>
          <title>Draw | Moonveil Entertainment</title>
        </Head>

        <ShineBackground />

        <MeteorLayer className="z-10" />

        <DrawScreen ended={ended} item={poolInfo} onUpdate={onUpdate} />

        <RulesScreen item={poolInfo} />
      </section>
    </>
  );
};

export default observer(LotteryPage);
