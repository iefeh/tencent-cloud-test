import Astronaut from '@/components/LoyaltyProgram/season/Astronaut';
import Planetoid from '@/components/LoyaltyProgram/season/Planetoid';
import ShineBackground from '@/components/LoyaltyProgram/season/ShineBackground';
import BGScreen from '@/components/LoyaltyProgram/season/noPass/BGScreen';
import NoPassIndexScreen from '@/components/LoyaltyProgram/season/noPass/IndexScreen';
import MainScreen from '@/components/LoyaltyProgram/season/noPass/MainScreen';
import { useBattlePassContext } from '@/store/BattlePass';
import { observer } from 'mobx-react-lite';
import Head from 'next/head';
import { FC, useEffect } from 'react';

const ForeSightPage: FC = () => {
  const { init } = useBattlePassContext();

  useEffect(() => {
    init();
  }, []);

  return (
    <section className="w-full">
      <Head>
        <title>Moonveil Entertainment</title>
      </Head>

      <div className="relative w-full h-screen overflow-y-auto">
        <BGScreen />

        <ShineBackground />

        <div className="absolute inset-0 pointer-events-none">
          <Astronaut className="!absolute right-[17.25rem] top-[42rem] w-[11.8125rem] h-[13.5625rem]" />

          <Planetoid className="!absolute left-[11.5rem] top-[30.875rem] w-[5.4375rem] h-[7.9375rem]" />
        </div>

        <NoPassIndexScreen />

        <MainScreen />
      </div>
    </section>
  );
};

export default observer(ForeSightPage);
