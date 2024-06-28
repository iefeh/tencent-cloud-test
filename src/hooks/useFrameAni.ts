import { getZipFiles } from '@/http/services/zip';
import { loadImage } from '@/utils/common';
import { useEffect, useRef, useState } from 'react';
import { isIOS } from 'react-device-detect';

interface Props {
  url: string;
  width: number;
  height: number;
  count: number;
  cover?: string;
  frames?: number;
  infinite?: boolean;
  fit?: 'cover' | 'contain';
  disableOnIOS?: boolean;
  nameFn: (index: number) => string;
  onFinished?: () => void;
}

export default function useFrameAni({
  url,
  width,
  height,
  count,
  cover,
  fit = 'contain',
  frames = 30,
  infinite = true,
  disableOnIOS = false,
  nameFn,
  onFinished,
}: Props) {
  const ratio = width / height;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const currentIdxRef = useRef(0);
  const lastElRef = useRef(0);
  const rafId = useRef(0);
  const imgs = useRef<ImageBitmap[]>([]);
  const initImagesPromise = useRef<Promise<boolean> | null>(null);
  const frameEl = 1000 / frames;
  const [realWidth, setRealWidth] = useState(width);
  const [realHeight, setRealHeight] = useState(height);
  const aniEnabled = !disableOnIOS || !isIOS;

  function initCanvas() {
    if (!canvasRef.current) return;

    canvasRef.current.width = width;
    canvasRef.current.height = height;
    const { clientWidth, clientHeight } = canvasRef.current.parentElement!;

    let realWidth = clientWidth;
    let realHeight = clientHeight;

    if (fit === 'cover') {
      if (clientWidth / clientHeight > ratio) {
        realHeight = clientWidth / ratio;
      } else {
        realWidth = clientHeight * ratio;
      }
    } else {
      if (clientWidth / clientHeight > ratio) {
        realWidth = clientHeight * ratio;
      } else {
        realHeight = clientWidth / ratio;
      }
    }

    canvasRef.current.style.width = `${realWidth}px`;
    canvasRef.current.style.height = `${realHeight}px`;
    setRealWidth(realWidth);
    setRealHeight(realHeight);

    ctxRef.current = canvasRef.current.getContext('2d');

    if (cover) {
      loadImage(cover).then((res) => {
        ctxRef.current?.drawImage(res, 0, 0);
      });
    }
  }

  function initImages() {
    if (!ctxRef.current) return false;
    if (initImagesPromise.current) return initImagesPromise.current;

    initImagesPromise.current = new Promise(async (resolve) => {
      imgs.current = Array(count).fill(null);
      const files = await getZipFiles(url);
      if (!files) return false;

      await Promise.all(
        Array(count)
          .fill(0)
          .map(async (_, i) => {
            const file = files[nameFn(i)];
            const blob = await file.async('blob');
            const bitmap = await createImageBitmap(blob);
            imgs.current[i] = bitmap;
          }),
      );

      resolve(true);
    });
  }

  async function aniLoop(el = performance.now()) {
    if (!ctxRef.current || imgs.current.length < count) return;
    if (el - lastElRef.current < frameEl) {
      rafId.current = requestAnimationFrame(aniLoop);
      return;
    }

    if (currentIdxRef.current >= count - 1) {
      onFinished?.();
      if (!infinite) return;
    }

    const index = (currentIdxRef.current + 1) % count;
    ctxRef.current.clearRect(0, 0, width, height);
    const img = imgs.current[index];
    if (img) ctxRef.current.drawImage(img, 0, 0, width, height);
    currentIdxRef.current = index;
    lastElRef.current = el;

    rafId.current = requestAnimationFrame(aniLoop);
  }

  function startAni() {
    stopAni();
    lastElRef.current = performance.now();
    aniLoop();
  }

  function stopAni() {
    if (!rafId.current) return;

    cancelAnimationFrame(rafId.current);
    rafId.current = 0;
    currentIdxRef.current = 0;
  }

  useEffect(() => {
    initCanvas();
    if (aniEnabled) initImages();
  }, []);

  useEffect(() => {
    if (aniEnabled) {
      const promise = initImages();
      if (!promise) return;
      promise.then(() => startAni());
    }

    return stopAni;
  }, []);

  return { canvasRef, width: realWidth, height: realHeight, startAni };
}
