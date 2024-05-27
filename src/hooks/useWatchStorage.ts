import { useUserContext } from '@/store/User';
import { useEffect, useRef } from 'react';
import { isMobile } from 'react-device-detect';

interface Props {
  enableOnPC?: string;
  key: string;
  callback?: (val: string | null) => void;
}

export default function useWatchStorage({ key, enableOnPC, callback }: Props) {
  const { userInfo } = useUserContext();
  const timer = useRef(0);
  const initValue = useRef(localStorage.getItem(key));

  function checkStorage() {
    const val = localStorage.getItem(key);
    if (val === initValue.current) return;

    stopWatch();
    callback?.(val);
  }

  function startWatch() {
    checkStorage();

    timer.current = window.setInterval(checkStorage, 300);
  }

  function stopWatch() {
    if (!timer.current) return;
    clearInterval(timer.current);
    timer.current = 0;
  }

  useEffect(() => {
    stopWatch();
  }, [userInfo]);

  return { startWatch, stopWatch };
}
