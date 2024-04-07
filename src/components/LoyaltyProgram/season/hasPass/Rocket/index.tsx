import { useBattlePassContext } from '@/store/BattlePass';
import Image from 'next/image';
import { FC, useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { IntersectionObserverHook } from '@/hooks/intersectionObserverHook';

const Rocket: FC = () => {
  const { currentProgress } = useBattlePassContext();
  const rocketRef = useRef<HTMLDivElement>(null);
  const targetY = useRef(0);
  const currentY = useRef(0);
  const lastElRef = useRef(0);
  const rafIdRef = useRef(0);
  const visible = IntersectionObserverHook({ currentRef: rocketRef });

  function launch(el: number) {
    if (!rocketRef.current) return;

    const diff = el - lastElRef.current;
    if (diff < 16) {
      rafIdRef.current = requestAnimationFrame(launch);
      return;
    }

    const direction = currentY.current < targetY.current ? 1 : -1;
    const speed = 0.1 * (1 + Math.floor(currentProgress / 0.1) * 0.15);
    const ty = currentY.current + diff * speed * direction;
    if (ty < targetY.current) return;
    const targetDirection = ty < targetY.current ? 1 : -1;

    currentY.current = ty;
    lastElRef.current = el;
    rocketRef.current.style.transform = `translate3d(-50%, ${ty}px, 0)`;
    if (direction !== targetDirection) return;

    rafIdRef.current = requestAnimationFrame(launch);
  }

  function initLaunch() {
    if (currentProgress === Infinity || Number.isNaN(currentProgress) || !rocketRef.current) return;

    const fontSize = parseInt(document.documentElement.style.fontSize) || 16;
    targetY.current = -currentProgress * 10 * fontSize * 18;
    lastElRef.current = performance.now();

    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }
    rafIdRef.current = requestAnimationFrame(launch);
  }

  function turnOff() {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = 0;
    }
  }

  useEffect(() => {
    initLaunch();

    return () => turnOff();
  }, [currentProgress]);

  useEffect(() => {
    if (visible) {
      initLaunch();
    }
  }, [visible]);

  return (
    <div
      ref={rocketRef}
      className="oppo-box w-[3.75rem] h-[19.3125rem] absolute left-1/2 -bottom-80 -translate-x-1/2 z-10"
    >
      <Image className="object-contain" src="/img/loyalty/season/rocket.png" alt="" fill sizes="100%" loading="eager" />
    </div>
  );
};

export default observer(Rocket);
