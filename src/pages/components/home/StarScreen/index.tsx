import { useState, createRef, useEffect, useRef, useLayoutEffect } from 'react';
import planetImg from 'img/home/planet.png';
import Image from 'next/image';
import { generateStarAni } from '@/hooks/star';
import { createPortal } from 'react-dom';

export default function StarScreen() {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const canvasRef = createRef<HTMLCanvasElement>();
  const planetRef = useRef<HTMLImageElement>(null);
  const rafId = useRef(0);

  function setSize() {
    setWidth(document.documentElement.clientWidth);
    setHeight(document.documentElement.clientHeight);
  }

  useLayoutEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d')!;

    const { clientWidth, clientHeight } = document.documentElement;
    const { init, stop } = generateStarAni(ctx, clientWidth, clientHeight);
    init();

    return () => {
      stop();
      ctx.clearRect(0, 0, width, height);
    };
  }, []);

  useEffect(() => {
    setSize();

    window.addEventListener('resize', setSize);
    return () => window.removeEventListener('resize', setSize);
  }, []);

  function setLuxyTrans() {
    if (!planetRef.current) return;

    const y = window.luxy.getWrapperTranslateY();
    const cur = 1.2 - ((y - document.documentElement.clientHeight) / document.documentElement.clientHeight / 2) * 0.6;
    planetRef.current.style.setProperty('--scale', cur + '');
    rafId.current = requestAnimationFrame(setLuxyTrans);
  }

  function onLuxyScroll() {
    if (rafId.current > 0) cancelAnimationFrame(rafId.current);
    setLuxyTrans();
  }

  useEffect(() => {
    window.addEventListener('scroll', onLuxyScroll);
    return () => window.removeEventListener('scroll', onLuxyScroll);
  }, []);

  const StarContent = (
    <div className="star-screen z-0 fixed left-0 top-0 w-full h-screen pointer-events-none flex justify-center items-center">
      <Image
        ref={planetRef}
        className="bg-img w-[80vw] h-[70vw] flex z-10 relative max-lg:top-[22rem] -top-36 origin-center"
        src={planetImg}
        alt=""
      />

      <canvas
        ref={canvasRef}
        className="bg-star absolute left-0 top-0 w-full h-full z-0"
        width={width}
        height={height}
      ></canvas>
    </div>
  );

  return createPortal(StarContent, document.body);
}
