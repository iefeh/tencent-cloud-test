import { useState, createRef, useEffect, useRef, useLayoutEffect, MutableRefObject } from 'react';
import planetImg from 'img/home/planet.png';
import Image from 'next/image';
import useRAF from '@/hooks/raf';
import { generateStarAni } from '@/hooks/star';

interface Props {
  scrollY: number;
}

export default function StarScreen(props: Props) {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const canvasRef = createRef<HTMLCanvasElement>();
  const planetRef = useRef<HTMLImageElement>(null);

  const { update } = useRAF({
    base: 1.2,
    min: 0.6,
    max: 1.2,
    baseDuration: 1000,
    getNextTarget: (y) =>
      1.2 - ((y - document.documentElement.clientHeight) / document.documentElement.clientHeight / 2) * 0.6,
    callback: (cur) => {
      if (!planetRef.current) return;

      planetRef.current.style.setProperty('--scale', cur + '');
    },
  });

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

  useEffect(() => {
    if (props.scrollY < 0) {
      update(-props.scrollY);
    }
  }, [props.scrollY]);

  return (
    <div className="star-screen z-0 absolute left-0 top-0 w-full h-screen pointer-events-none flex justify-center items-center">
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
}
