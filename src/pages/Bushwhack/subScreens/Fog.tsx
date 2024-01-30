import Image from 'next/image';
import fogImg from 'img/bushwhack/fog/fog.jpg';
import sceneImg from 'img/bushwhack/fog/scene.jpg';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@nextui-org/react';
import { debounce } from 'lodash';
import leftFogImg from 'img/bushwhack/content/fog_left.png';
import rightFogImg from 'img/bushwhack/content/fog_right.png';
import FogMasks from './components/FogMasks';
import { BASE_CLIENT_HEIGHT, BASE_CLIENT_WIDTH } from '@/constant/common';

interface Coord {
  x: number;
  y: number;
}

interface FogCoord extends Coord {
  timestamp: number;
  times: number;
  fps: number;
  coverTimes: number;
  coverFps: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  scatters: Coord[];
}

export default function FogScreen() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fogImgRef = useRef<HTMLImageElement>(null);
  const ctx = useRef<CanvasRenderingContext2D | null>(null);
  const destInCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const destOutCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const destInCtx = useRef<CanvasRenderingContext2D | null>(null);
  const destOutCtx = useRef<CanvasRenderingContext2D | null>(null);
  const previewCtx = useRef<CanvasRenderingContext2D | null>(null);
  const [width, setWidth] = useState(BASE_CLIENT_WIDTH);
  const [height, setHeight] = useState(BASE_CLIENT_HEIGHT);
  const [isStarting, setIsStarting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const isRunningRef = useRef(false);
  const isViewing = useRef(false);
  const [isResizing, setIsResizing] = useState(false);
  const x = useRef(0);
  const y = useRef(0);
  const [shadowWidth, setShadowWidth] = useState(BASE_CLIENT_WIDTH);
  const [shadowHeight, setShadowHeight] = useState(BASE_CLIENT_HEIGHT);
  const arcs = useRef<FogCoord[]>([]);
  const lastTimestamp = useRef(0);
  const rafId = useRef(0);

  const RADIUS_MIN = 20;
  const RADIUS_MAX = 100;
  const MAX_ERASE_TIMES = 10;
  const MAX_ERASE_FPS = 10;

  function init() {
    setIsResizing(true);
    const { innerWidth, innerHeight } = window;
    setWidth(innerWidth);
    setHeight(innerHeight);
    const ratio = Math.min(innerWidth / BASE_CLIENT_WIDTH, innerHeight / BASE_CLIENT_HEIGHT);
    setShadowWidth(innerWidth * ratio);
    setShadowHeight(innerHeight * ratio);
    if (innerWidth / BASE_CLIENT_WIDTH > innerHeight / BASE_CLIENT_HEIGHT) {
      setShadowWidth((innerHeight * BASE_CLIENT_WIDTH) / BASE_CLIENT_HEIGHT);
      setShadowHeight(innerHeight);
    } else {
      setShadowWidth(innerWidth);
      setShadowHeight((innerWidth * BASE_CLIENT_HEIGHT) / BASE_CLIENT_WIDTH);
    }

    setTimeout(() => {
      initCanvas(innerWidth, innerHeight);
    }, 100);

    window.addEventListener('resize', init);
  }

  function renderFog(el: number = lastTimestamp.current) {
    if (arcs.current.length < 1) {
      rafId.current = requestAnimationFrame(renderFog);
      return;
    }

    if (!isRunningRef.current || !ctx.current || !destInCtx.current || !destOutCtx.current || !fogImgRef.current)
      return;

    if (isViewing.current) {
      rafId.current = requestAnimationFrame(renderFog);
      return;
    }

    for (let i = arcs.current.length - 1; i > -1; i--) {
      const coord = arcs.current[i];
      if (coord.timestamp < el) {
        renderFogAt(coord, i);
      }
    }

    renderCanvas();

    rafId.current = requestAnimationFrame(renderFog);
  }

  function renderFogAt(coord: FogCoord, index: number) {
    if (!destOutCtx.current) return;

    const { times, fps, x: pX, y: pY, scatters } = coord;
    const isInside = Math.sqrt((pX - x.current) ** 2 + (pY - y.current) ** 2) < RADIUS_MAX * 2;

    if (!isInside && times <= 0) {
      if (coord.coverFps === 0) {
        restoreFog(coord);
        coord.coverTimes++;
        coord.coverFps = MAX_ERASE_FPS;
      } else {
        coord.coverFps--;
      }

      if (coord.coverTimes >= MAX_ERASE_TIMES) {
        arcs.current.splice(index, 1);
      }

      return;
    }

    if (fps === 0) {
      const dx = pX + Math.random() * 50 - 100;
      const dy = pY + Math.random() * 50 - 100;

      if (dx < coord.minX) coord.minX = dx;
      if (dx > coord.maxX) coord.maxX = dx;
      if (dy < coord.minY) coord.minY = dy;
      if (dy > coord.maxY) coord.maxY = dy;

      scatters.push({ x: dx, y: dy });

      eraseFog(dx, dy);

      coord.times--;
      coord.fps = MAX_ERASE_FPS;
    } else {
      coord.fps--;
    }

    previewCtx.current?.clearRect(0, 0, width, height);
    previewCtx.current?.drawImage(destOutCanvasRef.current!, 0, 0);
  }

  function restoreFog(coord: FogCoord) {
    if (!destOutCtx.current) return;

    const { minX, maxX, minY, maxY, scatters } = coord;
    destOutCtx.current!.globalCompositeOperation = 'source-over';
    destOutCtx.current.save();
    destOutCtx.current.beginPath();

    scatters.forEach(({ x: ax, y: ay }) => {
      destOutCtx.current!.arc(ax, ay, RADIUS_MAX, 0, Math.PI * 2);
    });

    destOutCtx.current.clip();

    destOutCtx.current.globalAlpha = 1 / MAX_ERASE_TIMES;
    destOutCtx.current.drawImage(
      destInCanvasRef.current!,
      minX - RADIUS_MAX,
      minY - RADIUS_MAX,
      maxX - minX + RADIUS_MAX * 2,
      maxY - minY + RADIUS_MAX * 2,
      minX - RADIUS_MAX,
      minY - RADIUS_MAX,
      maxX - minX + RADIUS_MAX * 2,
      maxY - minY + RADIUS_MAX * 2,
    );
    destOutCtx.current.globalAlpha = 1;
    destOutCtx.current.restore();
  }

  function eraseFog(dx: number, dy: number, alpha = 0.05) {
    if (!destOutCtx.current) return;

    destOutCtx.current!.globalCompositeOperation = 'destination-out';

    /** Out层擦除雾气 */
    const radGrd = destOutCtx.current.createRadialGradient(dx, dy, RADIUS_MIN, dx, dy, RADIUS_MAX);
    radGrd.addColorStop(0, `rgba(0, 0, 0, ${alpha})`);
    radGrd.addColorStop(0.9, 'rgba(0, 0, 0, 0)');
    radGrd.addColorStop(1, 'rgba(0, 0, 0, 0)');

    destOutCtx.current.fillStyle = radGrd;
    destOutCtx.current.fillRect(dx - RADIUS_MAX, dy - RADIUS_MAX, RADIUS_MAX * 2, RADIUS_MAX * 2);
  }

  function renderCanvas() {
    if (!ctx.current) return;

    /** 合并两层图像，In层需要后渲染 */
    ctx.current.clearRect(0, 0, width, height);
    ctx.current.drawImage(previewCanvasRef.current!, 0, 0);
    // ctx.current.drawImage(destInCanvasRef.current!, 0, 0);
  }

  function onFogMousemove(e: MouseEvent) {
    e.preventDefault();
    if (!ctx.current || isViewing.current || !isRunningRef.current) return;

    const { x: pX, y: pY } = e;
    x.current = pX;
    y.current = pY;

    const now = performance.now();
    lastTimestamp.current = Math.max(lastTimestamp.current, now) + 10;
    const coord: FogCoord = {
      x: pX,
      y: pY,
      timestamp: lastTimestamp.current,
      times: MAX_ERASE_TIMES,
      fps: 0,
      coverTimes: 0,
      coverFps: 0,
      minX: Infinity,
      maxX: -Infinity,
      minY: Infinity,
      maxY: -Infinity,
      scatters: [],
    };
    arcs.current.push(coord);
  }

  const initCanvas = debounce((w = width, h = height) => {
    if (!canvasRef.current || !fogImgRef.current) return;

    const canvasList = [destInCanvasRef, destOutCanvasRef, previewCanvasRef];
    const ctxList = [destInCtx, destOutCtx, previewCtx];
    canvasList.forEach((cr, index) => {
      if (!cr.current) {
        cr.current = document.createElement('canvas');
      }

      cr.current.width = w;
      cr.current.height = h;
      ctxList[index].current = cr.current.getContext('2d');
      ctxList[index].current?.clearRect(0, 0, w, h);
    });

    const context = canvasRef.current.getContext('2d')!;
    context.clearRect(0, 0, w, h);
    ctx.current = context;

    const { width: fogWidth, height: fogHeight } = fogImgRef.current;
    destOutCtx.current!.drawImage(fogImgRef.current, 0, 0, fogWidth, fogHeight);
    destInCtx.current!.drawImage(fogImgRef.current, 0, 0, fogWidth, fogHeight);
    previewCtx.current!.drawImage(fogImgRef.current, 0, 0, fogWidth, fogHeight);

    renderCanvas();

    window.addEventListener('mousemove', onFogMousemove);

    setIsResizing(false);
  }, 300);

  function onGameTitleMouseEnter() {
    setIsStarting(true);
    setTimeout(() => {
      isRunningRef.current = true;
      setIsRunning(true);
    }, 1600);
  }

  useEffect(() => {
    init();
    renderFog();

    return () => {
      window.removeEventListener('resize', init);
      window.removeEventListener('mousemove', onFogMousemove);
    };
  }, []);

  return (
    <div className="w-screen h-screen relative select-none flex justify-center items-center">
      <Image ref={fogImgRef} className="invisible" src={fogImg} alt="" fill />

      <Image className={cn(['w-full h-full object-contain', isResizing && 'invisible'])} src={sceneImg} alt="" />

      <div
        className={cn([
          'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0 shadow-[inset_0_0_4rem_2rem_#000]',
          isResizing && 'invisible',
        ])}
        style={{ width: `${shadowWidth}px`, height: `${shadowHeight}px` }}
      ></div>

      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="absolute w-full h-full left-0 top-0 z-20 transition-opacity !duration-[3000ms] pointer-events-none"
      ></canvas>

      <FogMasks onViewChange={(val) => (isViewing.current = val)} />

      <div
        className={cn([
          'absolute left-1/2 top-1/2 z-30 font-semakin text-[5.625rem] drop-shadow-[0_0_20px_rgba(0,0,0,0.4)] -translate-x-1/2 -translate-y-1/2 transition-opacity !duration-[1500ms]',
          (isStarting || isRunning) && 'opacity-0 pointer-events-none',
        ])}
        onMouseEnter={onGameTitleMouseEnter}
        onTouchEnd={onGameTitleMouseEnter}
      >
        Hunt in the Mist
      </div>

      <div
        className="absolute top-0 left-0 -translate-y-full rotate-180 w-full h-24 z-30 overflow-hidden pointer-events-none"
        style={{ mask: 'linear-gradient(to bottom, #000 0, rgba(0,0,0,0.3) 50%, transparent 100%)' }}
      >
        <Image className="w-full h-auto" src={fogImg} alt="" />
      </div>

      <div
        className="absolute bottom-0 left-0 translate-y-full rotate-180 w-full h-24 z-30 overflow-hidden pointer-events-none"
        style={{ mask: 'linear-gradient(to top, rgba(0,0,0,0.9) 0, rgba(0,0,0,0.3) 50%, transparent 100%)' }}
      >
        <Image className="w-full h-auto relative bottom-0" src={fogImg} alt="" />
      </div>

      <Image
        className="w-[57.875rem] h-[50rem] object-cover absolute left-0 -top-[17rem] z-40 pointer-events-none"
        src={leftFogImg}
        alt=""
      />

      <Image
        className="w-[68.125rem] h-[50rem] object-cover absolute right-0 -top-[26.5625rem] z-40 pointer-events-none"
        src={rightFogImg}
        alt=""
      />

      <Image
        className="w-[57.875rem] h-[50rem] object-cover absolute left-0 -bottom-[33rem] z-40 pointer-events-none"
        src={leftFogImg}
        alt=""
      />
      <Image
        className="w-[68.125rem] h-[50rem] object-cover absolute right-0 -bottom-[23.4375rem] z-40 pointer-events-none"
        src={rightFogImg}
        alt=""
      />
    </div>
  );
}
