import Image from 'next/image';
import fogImg from 'img/bushwhack/fog/fog.jpg';
import sceneImg from 'img/bushwhack/fog/scene.jpg';
import { useEffect, useRef, useState } from 'react';

export default function FogScreen() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fogImgRef = useRef<HTMLImageElement>(null);
  const ctx = useRef<CanvasRenderingContext2D | null>(null);
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const rafId = useRef(0);
  const isRenderering = useRef(false);
  const x = useRef(0);
  const y = useRef(0);

  const RADIUS_MIN = 1;
  const RADIUS_MAX = 100;
  const DENSITY = 0.01;

  function init() {
    const { innerWidth, innerHeight } = window;
    setWidth(innerWidth);
    setHeight(innerHeight);

    setTimeout(() => {
      initCanvas();
    }, 100);
  }

  function initCanvas() {
    if (!canvasRef.current || !fogImgRef.current) return;

    const context = canvasRef.current.getContext('2d')!;
    ctx.current = context;

    context.drawImage(fogImgRef.current, 0, 0);

    setTimeout(() => {
      context.globalCompositeOperation = 'destination-out';
    }, 100);

    // canvasRef.current.addEventListener('mousedown', (e) => {
    //   const { clientX, clientY } = e;
    //   e.preventDefault();
    //   isRenderering.current = true;
    //   x.current = clientX;
    //   y.current = clientY;
    // });

    window.addEventListener('mousemove', (e) => {
      e.preventDefault();
      // if (!isRenderering.current || !ctx.current) return;
      if (!ctx.current) return;

      let { pageX: pX, pageY: pY } = e;

      // reveal wherever we drag
      const radGrd = context.createRadialGradient(pX, pY, RADIUS_MIN, pX, pY, RADIUS_MAX);
      radGrd.addColorStop(0, 'rgba(0, 0, 0, 1)');
      radGrd.addColorStop(DENSITY, 'rgba(0, 0, 0, .1)');
      radGrd.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.current.fillStyle = radGrd;
      ctx.current.fillRect(pX - RADIUS_MAX, pY - RADIUS_MAX, RADIUS_MAX * 2, RADIUS_MAX * 2);
    });

    window.addEventListener('mouseup', (e) => {
      e.preventDefault();
      isRenderering.current = false;
    });
  }

  useEffect(() => {
    init();
    window.addEventListener('resize', init);

    return () => window.removeEventListener('resize', init);
  }, []);

  return (
    <div className="w-screen h-screen relative">
      <Image ref={fogImgRef} className="invisible" src={fogImg} alt="" fill />
      <Image className="object-contain" src={sceneImg} alt="" fill />
      <canvas ref={canvasRef} width={width} height={height} className="relative z-10"></canvas>
    </div>
  );
}
