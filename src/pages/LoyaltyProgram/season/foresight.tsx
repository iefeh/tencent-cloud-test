import BGScreen from '@/components/LoyaltyProgram/season/noPass/BGScreen';
import NoPassIndexScreen from '@/components/LoyaltyProgram/season/noPass/IndexScreen';
import MainScreen from '@/components/LoyaltyProgram/season/noPass/MainScreen';
import { useBattlePassContext } from '@/store/BattlePass';
import { observer } from 'mobx-react-lite';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FC, useEffect } from 'react';

const ForeSightPage: FC = () => {
  const { info, init } = useBattlePassContext();
  const router = useRouter();

  useEffect(() => {
    init();
  }, []);

  // useEffect(() => {
  //   if (info && info.has_battle_pass) {
  //     router.replace('/LoyaltyProgram/season');
  //   }
  // }, [info]);

  return (
    <section className="w-full">
      <Head>
        <title>Moonveil Entertainment</title>
      </Head>

      <div className="relative w-full h-screen overflow-y-auto">
        <BGScreen />

        <NoPassIndexScreen />

        <MainScreen />
      </div>
    </section>
  );
};

export default observer(ForeSightPage);
