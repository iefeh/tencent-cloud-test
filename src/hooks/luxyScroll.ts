import { RefObject, useEffect, useRef, useState } from 'react';

export default function useLuxyScroll(descRef: RefObject<HTMLDivElement>) {
  const [scrolling, setScrolling] = useState(false);
  const [visible, setVisible] = useState(false);
  const scrollY = useRef(0);
  let timer = 0;

  function onLuxyScroll() {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    let scrolled = false;
    if (scrollTop !== scrollY.current) {
      scrollY.current = scrollTop;
      setScrolling(true);
      scrolled = true;
    }

    if (scrolled || scrolling) {
      if (timer) clearTimeout(timer);
      timer = window.setTimeout(() => setScrolling(false), 500);
    }
  }

  useEffect(() => {
    if (scrolling || !descRef.current) return;
    const top = descRef.current.getBoundingClientRect().top || 0;
    setVisible(top > -descRef.current.clientHeight && top < document.documentElement.clientHeight);
  }, [scrolling]);

  useEffect(() => {
    window.addEventListener('scroll', onLuxyScroll);
    return () => window.removeEventListener('scroll', onLuxyScroll);
  }, []);

  return { visible };
}
