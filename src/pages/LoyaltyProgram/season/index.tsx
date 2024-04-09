import HasPassIndexScreen from '@/components/LoyaltyProgram/season/hasPass/IndexScreen';
import { useBattlePassContext } from '@/store/BattlePass';
import { observer } from 'mobx-react-lite';
import Head from 'next/head';
import RocketScreen from '@/components/LoyaltyProgram/season/hasPass/RocketScreen';
import { UIEventHandler, useEffect, useRef, useState } from 'react';
import LGButton from '@/pages/components/common/buttons/LGButton';
import ArrowRightSVG from 'svg/arrow_right.svg';
import FloatParts from '@/components/LoyaltyProgram/season/hasPass/FloatParts';
import FinalScreen from '@/components/LoyaltyProgram/season/hasPass/FinalScreen';
import RuleModal from '@/components/LoyaltyProgram/season/RuleModal';
import { cn, useDisclosure } from '@nextui-org/react';
import { createBattlePassAPI } from '@/http/services/battlepass';
import MeteorLayer from '@/components/LoyaltyProgram/season/MeteorLayer';
import ShineBackground from '@/components/LoyaltyProgram/season/ShineBackground';
import { useUserContext } from '@/store/User';

function SeasonBattle() {
  const { userInfo, toggleLoginModal } = useUserContext();
  const { init, info, hasAcheivedFinalPass, progressInfo } = useBattlePassContext();
  const { totalProgress } = progressInfo || {};
  const contentRef = useRef<HTMLDivElement>(null);
  const [floatVisible, setFloatVisible] = useState(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [loading, setLoading] = useState(false);

  async function onExplore() {
    if (!userInfo) {
      toggleLoginModal(true);
      return;
    }

    if (!info?.has_battle_pass) {
      setLoading(true);
      await init(true, true);
      setLoading(false);
    }

    const resHeight = 15 + 18 * totalProgress * 10;
    const fontSize = parseInt(document.documentElement.style.fontSize) || 16;
    const top = resHeight * fontSize + window.innerHeight / 2;

    contentRef.current?.scrollTo({ top });
  }

  const onContentScroll: UIEventHandler<HTMLDivElement> = (e) => {
    const {
      currentTarget: { scrollTop, scrollHeight, clientHeight },
    } = e;

    setFloatVisible(scrollTop > 5 && (!hasAcheivedFinalPass || scrollHeight - scrollTop - clientHeight > 5));
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <section className="w-full">
      <Head>
        <title>Season | Moonveil Entertainment</title>
        <link rel="preload" as="image" href="/img/loyalty/season/rocket.png" crossOrigin="anonymous"></link>
      </Head>

      <div className="w-full h-screen relative">
        <div
          ref={contentRef}
          className={cn([
            'w-full h-screen rotate-180 overflow-y-auto overflow-x-hidden [&>.oppo-box]:rotate-180',
            !info?.has_battle_pass && '!overflow-hidden',
          ])}
          onScroll={onContentScroll}
        >
          <ShineBackground key={info?.has_battle_pass ? 1 : 0} />

          <HasPassIndexScreen loading={loading} onExplore={onExplore} />

          {info?.has_battle_pass && <RocketScreen />}

          {hasAcheivedFinalPass && <FinalScreen />}
        </div>

        <LGButton
          className="absolute bottom-10 left-1/2 -translate-x-1/2 uppercase"
          label="Tasks"
          actived
          link={`${window?.location?.origin}/LoyaltyProgram/earn?from=lp`}
          suffix={<ArrowRightSVG className="w-7 h-7" />}
        />

        <FloatParts visible={floatVisible} onRuleClick={onOpen} />

        <MeteorLayer />

        <RuleModal isOpen={isOpen} onOpenChange={onOpenChange} />
      </div>
    </section>
  );
}

export default observer(SeasonBattle);
