import { useEffect, useRef } from 'react';

export default function useLoopQuery(fn: () => void, timeout = 10000) {
  const timerRef = useRef(0);

  function clearTimer() {
    if (timerRef.current) {
      timerRef.current = 0;
      clearInterval(timerRef.current);
    }
  }

  function query() {
    clearTimer();
    timerRef.current = window.setInterval(fn, timeout);
  }

  useEffect(() => {
    query();

    return () => clearTimer();
  }, []);
}
