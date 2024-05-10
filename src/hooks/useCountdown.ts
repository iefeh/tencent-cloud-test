import { useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

export default function useCountdown(targetTime: number, currentTime = Date.now(), callback?: (time: number) => void) {
  const lastTimestamp = useRef(performance.now());
  const leftTime = useRef(0);
  const rafId = useRef(0);

  function run(el: number = performance.now()) {
    leftTime.current = Math.max(leftTime.current - el + lastTimestamp.current, 0);
    lastTimestamp.current = el;
    callback?.(leftTime.current);
    if (leftTime.current <= 0) return;
    rafId.current = requestAnimationFrame(run);
  }

  useEffect(() => {
    leftTime.current = Math.max(targetTime - currentTime, 0);
    run();

    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
        rafId.current = 0;
      }
    };
  }, []);

  return { leftTime };
}
