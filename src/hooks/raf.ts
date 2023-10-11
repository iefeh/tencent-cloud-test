import { useRef, useEffect, MutableRefObject } from 'react';

function easeOutQuad(t: number, b: number, c: number, d: number) {
  return -c * (t /= d) * (t - 2) + b;
}

interface RAFOptions {
  min: number;
  max: number;
  base: number;
  baseDuration: number;
  callback?: (cur: number) => void;
  getNextTarget?: (y: number) => number;
}

export default function useRAF(options: RAFOptions) {
  const rafId = useRef(0);
  const maxScale = options.max;
  const scaleAniDuration = useRef(options.baseDuration);
  const startScale = useRef(options.base);
  const targetScale = useRef(options.base);
  const currenScale = useRef(options.base);
  const els = useRef(0);

  const runScaleAni = (curEl: number = els.current) => {
    let scale = 0;
    let isEnd = false;

    if (startScale < targetScale) {
      scale = easeOutQuad(curEl - els.current, startScale.current, targetScale.current, scaleAniDuration.current);
      isEnd = scale > targetScale.current || scale < startScale.current;
    } else {
      const deltaScale = easeOutQuad(
        curEl - els.current,
        targetScale.current,
        startScale.current,
        scaleAniDuration.current,
      );
      scale = targetScale.current + startScale.current - deltaScale;
      isEnd = scale < targetScale.current || scale > startScale.current;
    }

    if (isEnd || Math.abs(targetScale.current - scale) < 0.05) {
      scale = targetScale.current;
      startScale.current = targetScale.current;
      isEnd = true;
    }

    currenScale.current = scale;
    options.callback?.(scale);
    if (!isEnd) {
      rafId.current = requestAnimationFrame(runScaleAni);
    }
  };

  function runNextScale(nextTargetScale: number) {
    nextTargetScale = Math.max(options.min, Math.min(maxScale, nextTargetScale));
    if (targetScale.current === nextTargetScale) return;

    targetScale.current = nextTargetScale;
    scaleAniDuration.current = (1000 * Math.sqrt(Math.abs(targetScale.current - currenScale.current))) / 4;
    startScale.current = currenScale.current;
    els.current = performance.now();
    if (rafId.current > 0) cancelAnimationFrame(rafId.current);
    runScaleAni();
  }

  useEffect(() => {
    options.callback?.(options.base);
  }, []);

  const basesCalcTarge = () => (scrollY / document.documentElement.clientHeight) * maxScale;
  const calcTarget = options.getNextTarget || basesCalcTarge;

  return {
    update: (scrollY: number) => {
      if (rafId.current > 0) cancelAnimationFrame(rafId.current);

      const nextTargetScale = calcTarget(scrollY);
      runNextScale(nextTargetScale);
    },
  };
}
