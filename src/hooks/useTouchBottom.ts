import { throttle } from 'lodash';
import { useEffect, useState } from 'react';

export default function useTouchBottom() {
  const [isTouchedBottom, setIsTouchedBottom] = useState(false);
  const throttleSetIisTouchedBottom = throttle((isTB: boolean) => setIsTouchedBottom(isTB), 1000);
  function onLuxyScroll() {
    const { scrollHeight, scrollTop, clientHeight } = document.documentElement;
    const isTB = Math.abs(scrollTop - scrollHeight + clientHeight) < 1;
    throttleSetIisTouchedBottom(isTB);
  }

  useEffect(() => {
    window.addEventListener('scroll', onLuxyScroll);
    return () => window.removeEventListener('scroll', onLuxyScroll);
  }, []);

  return { isTouchedBottom };
}
