import BScroll, { Options } from 'better-scroll';
import { useEffect, useRef } from 'react';
import { isMobile } from 'react-device-detect';

const BASE_OPTIONS: Options = {
  scrollX: true,
  scrollY: false,
  scrollbar: true,
  probeType: 3,
};

export default function useBScroll(options: Options & { isMobileOnly?: boolean } = {}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bsRef = useRef<BScroll | null>(null);

  useEffect(() => {
    if (options.isMobileOnly && !isMobile) return;
    if (!scrollRef.current) return;

    bsRef.current = new BScroll(scrollRef.current, Object.assign({}, BASE_OPTIONS, options));

    return () => {
      if (bsRef.current) bsRef.current.destroy();
    };
  }, [() => scrollRef.current]);

  return { scrollRef, bsRef };
}
