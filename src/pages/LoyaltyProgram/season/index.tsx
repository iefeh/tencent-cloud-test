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
import { throttle } from 'lodash';
import { createBattlePassAPI } from '@/http/services/battlepass';

function SeasonBattle() {
  const { init, info, hasAcheivedFinalPass, currentProgress } = useBattlePassContext();
  const contentRef = useRef<HTMLDivElement>(null);
  const [afterIndexPage, setAfterIndexPage] = useState(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [loading, setLoading] = useState(false);

  async function onExplore() {
    if (!info?.has_battle_pass) {
      setLoading(true);
      await createBattlePassAPI();
      await init(true);
      setLoading(false);
    }

    const resHeight = 15 + 18 * currentProgress * 10;
    const fontSize = parseInt(document.documentElement.style.fontSize) || 16;
    const top = resHeight * fontSize + window.innerHeight / 2;

    contentRef.current?.scrollTo({ top });
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
          <HasPassIndexScreen loading={loading} onExplore={onExplore} />

          <RocketScreen />

          {hasAcheivedFinalPass && <FinalScreen />}
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
