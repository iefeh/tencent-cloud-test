import { FC, useEffect, useRef } from 'react';
import Ladder from '../../Ladder';
import FinalReward from '../../FinalReward';
import { useBattlePassContext } from '@/store/BattlePass';
import { observer } from 'mobx-react-lite';
import { cn } from '@nextui-org/react';
import Image from 'next/image';
import ufoImg from 'img/loyalty/season/ufo.png';
import rocksImg from 'img/loyalty/season/rocks.png';
import halfPlanetImg from 'img/loyalty/season/half_planet.png';
import satelliteImg from 'img/loyalty/season/satellite.png';
import Planetoid from '../../Planetoid';
import rocketImg from 'img/loyalty/season/rocket.png';

const RocketScreen: FC = () => {
  const { hasAcheivedFinalPass, currentProgress } = useBattlePassContext();
  const rocketRef = useRef<HTMLDivElement>(null);
  const targetY = useRef(0);
  const currentY = useRef(0);
  const lastElRef = useRef(0);
  const rafIdRef = useRef(0);

  function launch(el: number) {
    if (!rocketRef.current) return;

    const diff = el - lastElRef.current;
    if (diff < 16) {
      rafIdRef.current = requestAnimationFrame(launch);
      return;
    }

    const direction = currentY.current < targetY.current ? 1 : -1;
    const ty = currentY.current + diff * 0.1 * direction;
    const targetDirection = ty < targetY.current ? 1 : -1;

    currentY.current = ty;
    lastElRef.current = el;
    rocketRef.current.style.transform = `translate3d(-50%, ${ty}px, 0)`;
    if (direction !== targetDirection) return;

    rafIdRef.current = requestAnimationFrame(launch);
  }

  useEffect(() => {
    if (currentProgress === Infinity || Number.isNaN(currentProgress) || !rocketRef.current) return;

    const fontSize = parseInt(document.documentElement.style.fontSize) || 16;
    targetY.current = -currentProgress * 10 * fontSize * 18;
    lastElRef.current = performance.now();

    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }
    rafIdRef.current = requestAnimationFrame(launch);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = 0;
      }
    };
  }, [currentProgress]);

  return (
    <div
      className={cn([
        'oppo-box w-full relative z-10 flex flex-col justify-center items-center',
        hasAcheivedFinalPass ? 'mt-[19rem]' : 'mt-60',
      ])}
    >
      <div className="w-[21.125rem] h-[32.6875rem] absolute left-0 bottom-[52.3125rem]">
        <Image className="object-contain" src={halfPlanetImg} alt="" fill sizes="100%" />
      </div>

      <div className="w-[12.375rem] h-[13.3125rem] absolute left-[21.5rem] bottom-[90rem]">
        <Image className="object-contain" src={rocksImg} alt="" fill sizes="100%" />
      </div>

      <div className="w-[35.625rem] h-[14.625rem] absolute right-0 bottom-[119rem]">
        <Image className="object-contain" src={ufoImg} alt="" fill sizes="100%" />
      </div>

      <div className="w-[20.75rem] h-[13rem] absolute right-[8.5rem] bottom-[164rem]">
        <Image className="object-contain" src={satelliteImg} alt="" fill sizes="100%" />
      </div>

      <Planetoid className="w-[5.4375rem] h-[7.9375rem] !absolute right-[24.6875rem] bottom-[136rem]" />

      <Planetoid className="w-[5.4375rem] h-[7.9375rem] !absolute left-40 bottom-[36rem]" />

      {hasAcheivedFinalPass || <FinalReward className="mb-16 mt-60" />}

      <Ladder />

      <div
        ref={rocketRef}
        className="oppo-box w-[3.75rem] h-[19.3125rem] absolute left-1/2 -bottom-80 -translate-x-1/2 z-10"
      >
        <Image className="object-contain" src={rocketImg} alt="" />
      </div>
    </div>
  );
};

export default observer(RocketScreen);
