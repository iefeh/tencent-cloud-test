import Image from 'next/image';
import FogMasks from './FogMasks';
import FogTitle from './FogTitle';
import ShadowBorder from './ShadowBorder';
import { useEffect, useRef, useState } from 'react';
import { BASE_CLIENT_HEIGHT, BASE_CLIENT_WIDTH } from '@/constant/common';
import { debounce, throttle } from 'lodash';
import { cn } from '@nextui-org/react';
import fogImg from 'img/bushwhack/fog/fog.jpg';
import { getPointsOnLine } from '@/hooks/utils';
import Video from '@/pages/components/common/Video';

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

export default function FogMainContent() {
  const fogImgRef = useRef<HTMLImageElement>(null);
  const fogCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const previewCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [width, setWidth] = useState(BASE_CLIENT_WIDTH);
  const [height, setHeight] = useState(BASE_CLIENT_HEIGHT);

  const [isResizing, setIsResizing] = useState(false);
  const [isVideoVisible, setIsVideoVisible] = useState(false);
  const videoVisiblerTimerRef = useRef(0);
  const isViewingRef = useRef(false);
  const isRunningRef = useRef(false);

  const rafId = useRef(0);

  const x = useRef(0);
  const y = useRef(0);

  const coords = useRef<ArcCoord[]>([]);
  const lastTimestamp = useRef(0);

  function init() {
    setIsResizing(true);
    if (videoVisiblerTimerRef.current) {
      clearTimeout(videoVisiblerTimerRef.current);
    }
    setIsVideoVisible(false);
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
    videoVisiblerTimerRef.current = window.setTimeout(() => {
      setIsVideoVisible(true);
    }, 100);
  }, 300);

  function onMouseMove(e: MouseEvent) {
    e.preventDefault();
    if (!isRunningRef.current || !ctxRef.current) return;

    const { x: pX, y: pY } = e;

    const now = performance.now();
    lastTimestamp.current = Math.max(lastTimestamp.current, now);

    const points = getPointsOnLine([x.current, y.current], [pX, pY], RADIUS_MAX * 0.5, false, true);
    points.forEach(([dx, dy]) => {
      lastTimestamp.current += 10;
      const coord: ArcCoord = {
        x: dx,
        y: dy,
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
    });

    x.current = pX;
    y.current = pY;

    if (!rafId.current) {
      renderLoop();
    }
  }

  const onRun = throttle(function () {
    isRunningRef.current = true;
    coords.current = [];
    window.addEventListener('mousemove', onMouseMove);
  }, 300);

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

  function eraseFogLoopAt(ctx: CanvasRenderingContext2D, coord: ArcCoord, el: number) {
    const { x: pX, y: pY, timestamp, fps, scatters } = coord;

    if (fps === 0 || el - timestamp > 300) {
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
      const { timestamp, times } = coords.current[i];
      if (el < timestamp) continue;
      if (times <= 0) {
        coords.current.splice(i, 1);
        continue;
      }
      eraseFogLoopAt(previewCtxRef.current!, coords.current[i], el);
    }
  }

  function updateScene() {
    if (!ctxRef.current || !previewCtxRef.current) return;

    ctxRef.current.clearRect(0, 0, width, height);
    ctxRef.current.drawImage(previewCtxRef.current.canvas, 0, 0, width, height);
  }

  function renderLoop(el: number = performance.now()) {
    if (coords.current.length < 1) {
      rafId.current = 0;
      return;
    }

    if (isRunningRef.current && !isViewingRef.current && ctxRef.current) {
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
    <>
      <Image ref={fogImgRef} className="invisible pointer-events-none" src={fogImg} alt="" fill onLoad={initCanvas} />

      <Video
        className={cn(['w-full h-full object-contain', (isResizing || !isVideoVisible) && 'opacity-0'])}
        options={{
          poster: '/img/bushwhack/fog/scene.jpg',
          fluid: false,
          controls: false,
          sources: [
            {
              src: 'https://d3dhz6pjw7pz9d.cloudfront.net/bushwhack/background/misty.webm',
              type: 'video/webm',
            },
          ],
        }}
      />

      <ShadowBorder isResizing={isResizing} />

      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="absolute w-full h-full left-0 top-0 z-20 pointer-events-none"
      ></canvas>

      <FogMasks checkMousemove={() => isRunningRef.current} onViewChange={(val) => (isViewingRef.current = val)} />

      <FogTitle onRun={onRun} />
    </>
  );
}
