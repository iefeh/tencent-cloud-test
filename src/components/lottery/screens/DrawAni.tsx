import { loadImage } from '@/utils/common';
import { cn } from '@nextui-org/react';
import Head from 'next/head';
import { FC, useEffect, useRef } from 'react';

interface Props {
  visible?: boolean;
  onFinished?: () => void;
}

const DrawAni: FC<Props> = ({ visible, onFinished }) => {
  const BASE_WIDTH = 1280;
  const BASE_HEIGHT = 1920;
  const BASE_RATIO = BASE_WIDTH / BASE_HEIGHT;
  const IMG_COUNT = 23;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const currentIdxRef = useRef(0);
  const lastElRef = useRef(0);
  const rafId = useRef(0);
  const imgURLs = Array(IMG_COUNT)
    .fill(0)
    .map(
      (_, i) =>
        `https://moonveil-public.s3.ap-southeast-2.amazonaws.com/lottery/draw_ani/reward_00${(i + 1)
          .toString()
          .padStart(3, '0')}_1.png`,
    );
  const imgs = useRef<HTMLImageElement[]>([]);

  function initCanvas() {
    if (!canvasRef.current) return;

    const { clientWidth, clientHeight } = canvasRef.current.parentElement!;

    let realWidth = clientWidth;
    let realHeight = clientHeight;

    if (clientWidth / clientHeight > BASE_RATIO) {
      realHeight = clientWidth / BASE_RATIO;
    } else {
      realWidth = clientHeight * BASE_RATIO;
    }

    canvasRef.current.style.width = `${realWidth}px`;
    canvasRef.current.style.height = `${realHeight}px`;

    ctxRef.current = canvasRef.current.getContext('2d');
  }

  async function initImages() {
    if (!ctxRef.current) return;

    imgs.current = [];
    const firstImg = await loadImage(imgURLs[0]);
    imgs.current.push(firstImg);

    ctxRef.current.drawImage(firstImg, 0, 0, BASE_WIDTH, BASE_HEIGHT);

    const aniImgs = await Promise.all(imgURLs.slice(1).map((url) => loadImage(url)));
    imgs.current.push(...aniImgs);
  }

  async function aniLoop(el = performance.now()) {
    if (!ctxRef.current || imgs.current.length < IMG_COUNT) return;
    if (el - lastElRef.current < 30) {
      rafId.current = requestAnimationFrame(aniLoop);
      return;
    }

    if (currentIdxRef.current >= IMG_COUNT - 1) {
      onFinished?.();
      return;
    }

    const index = (currentIdxRef.current + 1) % IMG_COUNT;
    ctxRef.current.clearRect(0, 0, BASE_WIDTH, BASE_HEIGHT);
    ctxRef.current.drawImage(imgs.current[index], 0, 0, BASE_WIDTH, BASE_HEIGHT);
    currentIdxRef.current = index;
    lastElRef.current = el;

    rafId.current = requestAnimationFrame(aniLoop);
  }

  function stopAni() {
    if (!rafId.current) return;

    cancelAnimationFrame(rafId.current);
    rafId.current = 0;
  }

  useEffect(() => {
    initCanvas();
    initImages();
  });

  useEffect(() => {
    if (visible) {
      initImages().then(() => {
        stopAni();
        lastElRef.current = performance.now();
        aniLoop();
      });
    } else {
      stopAni();
    }

    return stopAni;
  }, [visible]);

  return (
    <div className={cn(['justify-center items-center absolute inset-0 z-0', visible ? 'flex' : 'hidden'])}>
      <Head>
        {imgURLs.map((url, index) => (
          <link key={index} rel="preload" as="image" href={url} crossOrigin="anonymous"></link>
        ))}
      </Head>

      <canvas ref={canvasRef} className="object-contain" width={BASE_WIDTH} height={BASE_HEIGHT}></canvas>
    </div>
  );
};

export default DrawAni;
