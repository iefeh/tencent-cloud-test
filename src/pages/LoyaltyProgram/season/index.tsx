import HasPassIndexScreen from '@/components/LoyaltyProgram/season/hasPass/IndexScreen';
import { useBattlePassContext } from '@/store/BattlePass';
import { observer } from 'mobx-react-lite';
import Head from 'next/head';
import RocketScreen from '@/components/LoyaltyProgram/season/hasPass/RocketScreen';
import { useEffect } from 'react';
import Image from 'next/image';
import rocketImg from 'img/loyalty/season/rocket.png';

function SeasonBattle() {
  const { init } = useBattlePassContext();

  useEffect(() => {
    init();
  }, []);

  return (
    <section className="w-full">
      <Head>
        <title>Season | Moonveil Entertainment</title>
      </Head>

      <div className="w-full h-screen">
        <div className="w-full h-screen rotate-180 overflow-y-auto [&>.oppo-box]:rotate-180">
          <HasPassIndexScreen />

          <RocketScreen />

          <div className="bg-red-300 w-full h-screen">3</div>
          <div className="bg-blue-300 w-full h-screen">4</div>
          <div className="bg-gray-400 w-full h-screen">5</div>

          <Image
            className="oppo-box w-[3.75rem] h-[19.3125rem] object-contain absolute left-1/2 top-[100vh] -translate-x-1/2 z-10"
            src={rocketImg}
            alt=""
          />
        </div>
      </div>
    </section>
  );
}

export default observer(SeasonBattle);
