import { cn } from '@nextui-org/react';
import { useEffect, useState } from 'react';

interface Props {
  onRun?: () => void;
}

export default function FogTitle(props: Props) {
  const { onRun } = props;
  const [isStarting, setIsStarting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => setLoaded(true), 50);
  }, []);

  if (isRunning) return null;

  function onGameTitleMouseEnter() {
    if (!loaded) return;
    setIsStarting(true);
  }

  function onTransitionEnd() {
    if (!isStarting || !loaded) return;
    setIsStarting(false);
    setIsRunning(true);
    onRun?.();
  }

  return (
    <div
      className={cn([
        'absolute left-1/2 top-1/2 z-30 font-semakin text-[5.625rem] drop-shadow-[0_0_20px_rgba(0,0,0,0.4)] -translate-x-1/2 -translate-y-1/2 transition-opacity !duration-[1500ms] text-center opacity-0',
        loaded && 'opacity-100',
        (isStarting || isRunning) && '!opacity-0 pointer-events-none',
      ])}
      onMouseMove={onGameTitleMouseEnter}
      onTouchEnd={onGameTitleMouseEnter}
      onTransitionEnd={onTransitionEnd}
    >
      Hunt in the Mist
    </div>
  );
}
