import HasPassIndexScreen from '@/components/LoyaltyProgram/season/hasPass/IndexScreen';
import { useBattlePassContext } from '@/store/BattlePass';
import { observer } from 'mobx-react-lite';
import Head from 'next/head';
import RocketScreen from '@/components/LoyaltyProgram/season/hasPass/RocketScreen';
import { UIEventHandler, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import rocketImg from 'img/loyalty/season/rocket.png';
import LGButton from '@/pages/components/common/buttons/LGButton';
import ArrowRightSVG from 'svg/arrow_right.svg';
import FloatParts from '@/components/LoyaltyProgram/season/hasPass/FloatParts';
import FinalScreen from '@/components/LoyaltyProgram/season/hasPass/FinalScreen';

function SeasonBattle() {
  const { init, hasAcheivedFinalPass } = useBattlePassContext();
  const contentRef = useRef<HTMLDivElement>(null);
  const [afterIndexPage, setAfterIndexPage] = useState(false);

  function onExplore() {
    contentRef.current?.scrollTo({ top: window.innerHeight });
  }

  const onContentScroll: UIEventHandler<HTMLDivElement> = (e) => {
    const {
      currentTarget: { scrollTop },
    } = e;

    // console.log(scrollTop);
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <section className="w-full">
      <Head>
        <title>Season | Moonveil Entertainment</title>
      </Head>

      <div className="w-full h-screen relative">
        <div
          ref={contentRef}
          className="w-full h-screen rotate-180 overflow-y-auto overflow-x-hidden [&>.oppo-box]:rotate-180"
          onScroll={onContentScroll}
        >
          <HasPassIndexScreen onExplore={onExplore} />

          <RocketScreen />

          {hasAcheivedFinalPass && <FinalScreen />}

          <Image
            className="oppo-box w-[3.75rem] h-[19.3125rem] object-contain absolute left-1/2 top-[100vh] -translate-x-1/2 z-10"
            src={rocketImg}
            alt=""
          />
        </div>

        <LGButton
          className="absolute bottom-10 left-1/2 -translate-x-1/2 uppercase"
          label="Tasks"
          actived
          suffix={<ArrowRightSVG className="w-7 h-7" />}
        />

        <FloatParts />
      </div>
    </section>
  );
}

export default observer(SeasonBattle);
