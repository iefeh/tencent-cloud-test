import { cn } from '@nextui-org/react';
import { useState } from 'react';

interface Props {
  onRun?: () => void;
}

export default function FogTitle(props: Props) {
  const { onRun } = props;
  const [isStarting, setIsStarting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  if (isRunning) return null;

  function onGameTitleMouseEnter() {
    setIsStarting(true);
  }

  function onTransitionEnd() {
    setIsStarting(false);
    setIsRunning(true);
    onRun?.();
  }

  return (
    <div
      className={cn([
        'absolute left-1/2 top-1/2 z-30 font-semakin text-[5.625rem] drop-shadow-[0_0_20px_rgba(0,0,0,0.4)] -translate-x-1/2 -translate-y-1/2 transition-opacity !duration-[1500ms] text-center',
        (isStarting || isRunning) && 'opacity-0 pointer-events-none',
      ])}
      onMouseEnter={onGameTitleMouseEnter}
      onTouchEnd={onGameTitleMouseEnter}
      onTransitionEnd={onTransitionEnd}
    >
      Hunt in the Mist
    </div>
  );
}
