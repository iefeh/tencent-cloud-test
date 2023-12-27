import { RefObject, useLayoutEffect, useRef } from 'react';

interface ShakeOptions {
  maxDegX?: number;
  maxDegY?: number;
}

export default function useShake(nodeRef: RefObject<HTMLDivElement>, options?: ShakeOptions) {
  const CLASS_HOVER_IN = 'shake-hover-in';
  const CLASS_HOVER_OUT = 'shake-hover-out';
  const { maxDegX: MAX_DEG_X = 16, maxDegY: MAX_DEG_Y = 8 } = options || {};
  const targetDX = useRef(0);
  const targetDY = useRef(0);

  function onMouseenter(e: MouseEvent) {
    if (!nodeRef.current) return;
    nodeRef.current.classList.remove(CLASS_HOVER_OUT);
    nodeRef.current.classList.add(CLASS_HOVER_IN);

    setTimeout(() => {
      if (!nodeRef.current) return;
      nodeRef.current.classList.remove(CLASS_HOVER_IN);
    }, 1000);
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
    nodeRef.current.style.transform = `rotateX(${dx}deg) rotateY(${dy}deg)`;

    const mask = nodeRef.current.querySelector<HTMLElement>(':scope .mask');
    if (!mask) return;
    const theta = Math.atan2(dy, dx);
    const angle = ((theta * 180) / Math.PI + 180) % 360;
    mask.style.background = `linear-gradient(${angle}deg, rgba(246,199,153,${
      (e.offsetY / offsetHeight) * 0.25
    }) 0%,rgba(246, 199, 153,0) 30%)`;
  }

  function onMouseleave(e: MouseEvent) {
    if (!nodeRef.current) return;
    nodeRef.current.classList.remove(CLASS_HOVER_IN);
    nodeRef.current.classList.add(CLASS_HOVER_OUT);

    setTimeout(() => {
      if (!nodeRef.current) return;
      nodeRef.current.classList.remove(CLASS_HOVER_OUT);
    }, 1000);

    targetDX.current = 0;
    targetDY.current = 0;
    nodeRef.current.style.transform = 'rotateX(0deg) rotateY(0deg)';

    const mask = nodeRef.current.querySelector<HTMLElement>(':scope .mask');
    if (!mask) return;
    mask.style.background = 'none';
  }

  useLayoutEffect(() => {
    if (!nodeRef.current) return;
    const pe = nodeRef.current.parentElement;
    if (!pe) return;

    pe.style.perspective = '1000px';
    pe.style.transformStyle = 'preserve-3d';
    nodeRef.current.style.perspective = '1000px';
    nodeRef.current.style.transformStyle = 'preserve-3d';
    nodeRef.current.addEventListener('mouseenter', onMouseenter);
    nodeRef.current.addEventListener('mousemove', onMousemove);
    nodeRef.current.addEventListener('mouseleave', onMouseleave);

    return () => {
      if (!nodeRef.current) return;
      nodeRef.current.removeEventListener('mouseenter', onMouseenter);
      nodeRef.current.removeEventListener('mousemove', onMousemove);
      nodeRef.current.removeEventListener('mouseleave', onMouseleave);
    };
  });
}
