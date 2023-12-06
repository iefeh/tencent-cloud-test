import { RefObject, useLayoutEffect, useRef } from 'react';

export default function useShake(nodeRef: RefObject<HTMLDivElement>) {
  const shakeDeg = useRef(0);

  function onMousemove(e: MouseEvent) {
    if (!nodeRef.current) return;
    const { offsetX, offsetY } = e;
    const { offsetWidth, offsetHeight } = nodeRef.current;
    const ox = offsetWidth / 2;
    const oy = offsetHeight / 2;

    const dx = ((offsetY - oy) / oy) * -8;
    const dy = ((offsetX - ox) / ox) * 4;
    nodeRef.current.style.transform = `rotateX(${dx}deg) rotateY(${dy}deg)`;
  }

  function onMouseleave(e: MouseEvent) {
    if (!nodeRef.current) return;
    // nodeRef.current.style.transition = 'transform';
    // nodeRef.current.style.transitionDuration = '50ms';
    // nodeRef.current.style.transform = 'none';
  }

  useLayoutEffect(() => {
    if (!nodeRef.current) return;
    const pe = nodeRef.current.parentElement;
    if (!pe) return;

    pe.style.perspective = '300px';
    nodeRef.current.addEventListener('mousemove', onMousemove);
    nodeRef.current.addEventListener('mouseleave', onMouseleave);

    return () => {
      if (!nodeRef.current) return;
      nodeRef.current.removeEventListener('mousemove', onMousemove);
      nodeRef.current.removeEventListener('mouseleave', onMouseleave);
    };
  });
}
