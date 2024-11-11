import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const aaMobileList = ['/AstrArk/deleteAccount', '/AstrArk/assets', '/AstrArk/shop', '/AstrArk/cbt-iap/inner'];

export default function useRem() {
  const router = useRouter();
  const isAAMobile = aaMobileList.includes(router.route);
  const [scale, setScale] = useState('1');

  function resetRem() {
    const width = document.documentElement.clientWidth;
    const fontSize = Math.max((16 * width) / 1920, isAAMobile ? 8 : 12);
    document.documentElement.style.fontSize = `${fontSize}px`;

    const ratio = window.devicePixelRatio;
    if (/windows|win32|win64|wow32|wow64/g.test(navigator.userAgent.toLowerCase())) {
      setScale((1 / ratio).toFixed(2));
    }
  }

  useEffect(() => {
    resetRem();
    const resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize';

    window.addEventListener(resizeEvt, resetRem);
    return () => window.removeEventListener(resizeEvt, resetRem);
  }, []);

  return { scale };
}
