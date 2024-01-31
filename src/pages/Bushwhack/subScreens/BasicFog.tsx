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
import FogTitle from './components/FogTitle';
import ShadowBorder from './components/ShadowBorder';
import CircularLoading from '@/pages/components/common/CircularLoading';

interface Coord {
  x: number;
  y: number;
  timestamp: number;
  times: number;
  fps: number;
}

interface ArcCoord extends Coord {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  scatters: Coord[];
}

const RADIUS_MIN = 20;
const RADIUS_MAX = 100;
const MAX_ERASE_TIMES = 10;
const MAX_ERASE_FPS = 10;

export default function SuperFogScreen() {
  const fogImgRef = useRef<HTMLImageElement>(null);
  const fogCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const previewCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [width, setWidth] = useState(BASE_CLIENT_WIDTH);
  const [height, setHeight] = useState(BASE_CLIENT_HEIGHT);

  const [isResizing, setIsResizing] = useState(false);
  const isViewingRef = useRef(false);
  const isRunningRef = useRef(false);
  const isStartingRef = useRef(false);
  const isPausingRef = useRef(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const rafId = useRef(0);

  const x = useRef(0);
  const y = useRef(0);

  const coords = useRef<ArcCoord[]>([]);
  const lastTimestamp = useRef(0);

  function init() {
    setIsResizing(true);
    const { innerWidth, innerHeight } = window;
    setWidth(innerWidth);
    setHeight(innerHeight);
  }

  const initCanvas = debounce(() => {
    if (!fogImgRef.current?.complete || !canvasRef.current) return;

    coords.current = [];
    const { innerWidth, innerHeight } = window;
    const { width: fogWidth, height: fogHeight } = fogImgRef.current;
    const el = document.createElement('canvas');
    el.width = innerWidth;
    el.height = innerHeight;
    previewCtxRef.current = el.getContext('2d');
    previewCtxRef.current!.drawImage(fogImgRef.current, 0, 0, fogWidth, fogHeight);

    const fogCanvas = document.createElement('canvas');
    fogCanvas.width = innerWidth;
    fogCanvas.height = innerHeight;
    const fogCtx = fogCanvas.getContext('2d')!;
    fogCtx.drawImage(fogImgRef.current, 0, 0, fogWidth, fogHeight);
    fogCanvasRef.current = fogCanvas;

    ctxRef.current = canvasRef.current.getContext('2d');
    updateScene();
    setIsResizing(false);
  }, 300);

  function onMouseMove(e: MouseEvent) {
    e.preventDefault();

    const { x: pX, y: pY } = e;
    x.current = pX;
    y.current = pY;

    const now = performance.now();
    lastTimestamp.current = Math.max(lastTimestamp.current, now) + 10;
    const coord: ArcCoord = {
      x: pX,
      y: pY,
      timestamp: lastTimestamp.current,
      times: MAX_ERASE_TIMES,
      fps: 0,
      scatters: [],
      minX: Infinity,
      maxX: -Infinity,
      minY: Infinity,
      maxY: -Infinity,
    };

    coords.current.push(coord);

    if (!rafId.current) {
      renderLoop();
    }
  }

  function onStop() {
    console.log('stop');
    setIsStarting(false);
    setIsRunning(false);
    isRunningRef.current = false;
    isStartingRef.current = false;
    window.removeEventListener('mousemove', onMouseMove);
  }

  function onGameTitleMouseEnter() {
    setIsStarting(true);
    isStartingRef.current = true;
  }

  function onTransitionEnd() {
    setIsStarting(false);
    isStartingRef.current = false;
    setIsRunning(true);
    isRunningRef.current = true;
    window.addEventListener('mousemove', onMouseMove);
  }

  function eraseFog(ctx: CanvasRenderingContext2D, dx: number, dy: number, alpha = 0.05) {
    ctx.globalCompositeOperation = 'destination-out';

    /** Out层擦除雾气 */
    const radGrd = ctx.createRadialGradient(dx, dy, RADIUS_MIN, dx, dy, RADIUS_MAX);
    radGrd.addColorStop(0, `rgba(0, 0, 0, ${alpha})`);
    radGrd.addColorStop(0.9, 'rgba(0, 0, 0, 0)');
    radGrd.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = radGrd;
    ctx.fillRect(dx - RADIUS_MAX, dy - RADIUS_MAX, RADIUS_MAX * 2, RADIUS_MAX * 2);
  }

  function eraseFogLoopAt(ctx: CanvasRenderingContext2D, coord: ArcCoord) {
    const { x: pX, y: pY, times, fps, scatters } = coord;
    if (times <= 0) return;

    if (fps === 0) {
      const dx = pX + Math.random() * 50 - 25;
      const dy = pY + Math.random() * 50 - 25;

      if (dx < coord.minX) coord.minX = dx;
      if (dx > coord.maxX) coord.maxX = dx;
      if (dy < coord.minY) coord.minY = dy;
      if (dy > coord.maxY) coord.maxY = dy;

      eraseFog(ctx, dx, dy);

      scatters.push({
        x: dx,
        y: dy,
        timestamp: 0,
        times: 0,
        fps: 0,
      });

      coord.times--;
      coord.fps = MAX_ERASE_FPS;

      if (coord.times <= 0) {
        coord.timestamp = Math.max(coord.timestamp, performance.now());
        for (let i = scatters.length - 1; i > -1; i--) {
          coord.timestamp += 10;
          scatters[i].timestamp = coord.timestamp;
          scatters[i].times = MAX_ERASE_TIMES;
        }
      }
    } else {
      coord.fps--;
    }
  }

  function updateCover(el: number) {}

  function updateErase(el: number) {
    for (let i = coords.current.length - 1; i > -1; i--) {
      const { timestamp } = coords.current[i];
      if (el < timestamp) continue;

      eraseFogLoopAt(previewCtxRef.current!, coords.current[i]);
    }
  }

  function updateScene() {
    if (!ctxRef.current || !previewCtxRef.current) return;

    ctxRef.current.clearRect(0, 0, width, height);
    ctxRef.current.drawImage(previewCtxRef.current.canvas, 0, 0, width, height);
  }

  function renderLoop(el: number = performance.now()) {
    try {
      const y = window.luxy.getWrapperTranslateY();
      isPausingRef.current = y !== height;
    } catch (error) {
      isPausingRef.current = true;
    }

    if (isPausingRef.current && isRunningRef.current) {
      rafId.current = 0;
      init();
      initCanvas();
      return;
    }

    if (coords.current.length < 1) {
      rafId.current = 0;
      return;
    }

    if (isRunningRef.current && !isViewingRef.current) {
      updateCover(el);

      updateErase(el);

      updateScene();
    }

    rafId.current = requestAnimationFrame(renderLoop);
  }

  useEffect(() => {
    init();
    window.addEventListener('resize', init);

    return () => {
      window.removeEventListener('resize', init);
      window.removeEventListener('mousemove', onMouseMove);

      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
        rafId.current = 0;
      }
    };
  }, []);

  return (
    <div className="w-screen h-screen relative select-none flex justify-center items-center">
      <Image ref={fogImgRef} className="invisible pointer-events-none" src={fogImg} alt="" fill onLoad={initCanvas} />

      <Image className={cn(['w-full h-full object-contain', isResizing && 'invisible'])} src={sceneImg} alt="" />

      <ShadowBorder isResizing={isResizing} />

      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="absolute w-full h-full left-0 top-0 z-20 pointer-events-none"
      ></canvas>

      <FogMasks onViewChange={(val) => (isViewingRef.current = val)} />

      {isRunning || (
        <div
          className={cn([
            'absolute left-1/2 top-1/2 z-30 font-semakin text-[5.625rem] drop-shadow-[0_0_20px_rgba(0,0,0,0.4)] -translate-x-1/2 -translate-y-1/2 transition-opacity !duration-[1500ms]',
            (isStarting || isRunning) && 'opacity-0 pointer-events-none',
          ])}
          onMouseEnter={onGameTitleMouseEnter}
          onTouchEnd={onGameTitleMouseEnter}
          onTransitionEnd={onTransitionEnd}
        >
          Hunt in the Mist
        </div>
      )}

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

      {isResizing && <CircularLoading />}
    </div>
  );
}
