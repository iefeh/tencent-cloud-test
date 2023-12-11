import { RefObject, useLayoutEffect, useRef } from 'react';

export default function useShake(nodeRef: RefObject<HTMLDivElement>) {
  const MAX_DEG_X = 8;
  const MAX_DEG_Y = 4;
  const STEP_DEG_X = 0.005;
  const STEP_DEG_Y = 0.002;
  const currentDX = useRef(0);
  const currentDY = useRef(0);
  const targetDX = useRef(0);
  const targetDY = useRef(0);
  const rafId = useRef(0);

  function levelOff() {
    if (!nodeRef.current) return;
    if (currentDX.current === targetDX.current && currentDY.current === targetDY.current) return;
    currentDX.current += (currentDX.current > targetDX.current ? -1 : 1) * STEP_DEG_X;
    currentDY.current += (currentDY.current > targetDY.current ? -1 : 1) * STEP_DEG_Y;

    if (Math.abs(targetDX.current - currentDX.current) < STEP_DEG_X) {
      currentDX.current = targetDX.current;
    }

    if (Math.abs(targetDY.current - currentDY.current) < STEP_DEG_Y) {
      currentDY.current = targetDY.current;
    }

    nodeRef.current.style.transform = `rotateX(${currentDX.current}deg) rotateY(${currentDY.current}deg)`;
    rafId.current = requestAnimationFrame(levelOff);
  }

  function onMousemove(e: MouseEvent) {
    if (!nodeRef.current) return;
    const { offsetX, offsetY } = e;
    const { offsetWidth, offsetHeight } = nodeRef.current;
    const ox = offsetWidth / 2;
    const oy = offsetHeight / 2;

    const dx = ((offsetY - oy) / oy) * -MAX_DEG_X;
    const dy = ((offsetX - ox) / ox) * MAX_DEG_Y;
    targetDX.current = dx;
    targetDY.current = dy;
    levelOff();
  }

  function onMouseleave(e: MouseEvent) {
    if (!nodeRef.current) return;
    targetDX.current = 0;
    targetDY.current = 0;
    levelOff();
  }

  useLayoutEffect(() => {
    if (!nodeRef.current) return;
    const pe = nodeRef.current.parentElement;
    if (!pe) return;

    pe.style.perspective = '300px';
    nodeRef.current.addEventListener('mouseenter', onMousemove);
    nodeRef.current.addEventListener('mousemove', onMousemove);
    nodeRef.current.addEventListener('mouseleave', onMouseleave);

    return () => {
      if (!nodeRef.current) return;
      nodeRef.current.removeEventListener('mouseenter', onMousemove);
      nodeRef.current.removeEventListener('mousemove', onMousemove);
      nodeRef.current.removeEventListener('mouseleave', onMouseleave);
    };
  });
}
