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
import RuleModal from '@/components/LoyaltyProgram/season/RuleModal';
import { cn, useDisclosure } from '@nextui-org/react';
import { throttle } from 'lodash';
import { createBattlePassAPI } from '@/http/services/battlepass';

function SeasonBattle() {
  const { init, info, hasAcheivedFinalPass } = useBattlePassContext();
  const contentRef = useRef<HTMLDivElement>(null);
  const [afterIndexPage, setAfterIndexPage] = useState(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [loading, setLoading] = useState(false);

  const createBattlePass = throttle(async () => {
    await createBattlePassAPI();
  }, 500);

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
          className={cn([
            'w-full h-screen rotate-180 overflow-y-auto overflow-x-hidden [&>.oppo-box]:rotate-180',
            !info && '!overflow-hidden',
          ])}
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

        <FloatParts onRuleClick={onOpen} />

        <RuleModal isOpen={isOpen} onOpenChange={onOpenChange} />
      </div>
    </section>
  );
}

export default observer(SeasonBattle);
