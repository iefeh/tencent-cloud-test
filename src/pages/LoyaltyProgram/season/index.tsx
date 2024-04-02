import BGScreen from '@/components/LoyaltyProgram/season/noPass/BGScreen';
import IndexScreen from '@/components/LoyaltyProgram/season/noPass/IndexScreen';
import MainScreen from '@/components/LoyaltyProgram/season/noPass/MainScreen';
import { useBattlePassContext } from '@/store/BattlePass';
import { observer } from 'mobx-react-lite';
import Head from 'next/head';

function SeasonBattle() {
  const { info } = useBattlePassContext();

  return (
    <section className="w-full">
      <Head>
        <title>Season | Moonveil Entertainment</title>
      </Head>

      {info ? (
        <div className="w-full h-screen rotate-180 overflow-y-auto [&>.oppo-box]:rotate-180">
          <div className="oppo-box bg-orange-300 w-full h-screen">1</div>
          <div className="oppo-box bg-green-300 w-full h-screen">2</div>
          <div className="oppo-box bg-red-300 w-full h-screen">3</div>
          <div className="oppo-box bg-blue-300 w-full h-screen">4</div>
          <div className="oppo-box bg-gray-400 w-full h-screen">5</div>
        </div>
      ) : (
        <div className="relative w-full h-screen overflow-y-auto">
          <BGScreen />

          <IndexScreen />

          <MainScreen />
        </div>
      )}
    </section>
  );
}

export default observer(SeasonBattle);
