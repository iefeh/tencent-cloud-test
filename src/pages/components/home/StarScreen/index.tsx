import { useState, createRef, useEffect, useRef, useLayoutEffect, MutableRefObject } from 'react';
import planetImg from 'img/home/planet.png';
import Image from 'next/image';
import useRAF from '@/hooks/raf';

interface Props {
  scrollY: number;
}

export default function StarScreen(props: Props) {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const canvasRef = createRef<HTMLCanvasElement>();
  const planetRef = useRef<HTMLImageElement>(null);
  const rafId = useRef(-1);

  // eslint-disable-next-line import/no-anonymous-default-export
  function initCanvas(ctx: CanvasRenderingContext2D) {
    var w = window.innerWidth,
      h = window.innerHeight,
      opts = {
        starCount: 40,

        radVel: 0.01,
        lineBaseVel: 0.1,
        lineAddedVel: 0.1,
        lineBaseLife: 0.4,
        lineAddedLife: 0.01,

        starBaseLife: 10,
        starAddedLife: 90,

        ellipseTilt: -0.3,
        ellipseBaseRadius: 0.15,
        ellipseAddedRadius: 0.02,
        ellipseAxisMultiplierX: 2,
        ellipseAxisMultiplierY: 1,
        ellipseCX: w / 2,
        ellipseCY: h / 2,

        repaintAlpha: 0.015,
      },
      stars: Star[] = [],
      first = true;

    function star_init() {
      if (rafId.current > 0) cancelAnimationFrame(rafId.current);
      stars = Array(opts.starCount)
        .fill(undefined)
        .map((_) => new Star());

      if (first) {
        loop();
        first = false;
      }
    }

    function loop() {
      step();
      draw();
      rafId.current = requestAnimationFrame(loop);
    }

    function step() {
      stars.map(function (star) {
        star.step();
      });
    }

    function draw() {
      ctx.translate(opts.ellipseCX, opts.ellipseCY);
      ctx.rotate(opts.ellipseTilt);
      ctx.scale(opts.ellipseAxisMultiplierX, opts.ellipseAxisMultiplierY);

      ctx.scale(1 / opts.ellipseAxisMultiplierX, 1 / opts.ellipseAxisMultiplierY);
      ctx.rotate(-opts.ellipseTilt);
      ctx.translate(-opts.ellipseCX, -opts.ellipseCY);

      stars.map(function (star) {
        star.draw();
      });
    }

    class Star {
      public x: number;
      public y: number;
      public lifeStep: number;
      public life: number;

      constructor() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.lifeStep = Math.random() > 0.5 ? 1 : -1;
        this.life = opts.starBaseLife + Math.random() * opts.starAddedLife;
      }

      step() {
        this.life += this.lifeStep;

        if (this.life <= 0 || this.life >= 100) {
          this.lifeStep *= -1;
        }
      }

      draw() {
        if (this.lifeStep < 0) {
          ctx.globalCompositeOperation = 'darken';

          ctx.fillStyle = ctx.shadowColor = `rgba(0, 0, 0, .1)`;
        } else {
          ctx.globalCompositeOperation = 'lighten';

          ctx.fillStyle = ctx.shadowColor = `rgba(255, 255, 255, .1)`;
        }
        ctx.shadowBlur = this.life;
        ctx.fillRect(this.x, this.y, 0.5, 0.5);
      }
    }

    window.addEventListener('resize', function () {
      w = window.innerWidth / 2;
      h = window.innerHeight / 2;

      opts.ellipseCX = w / 2;
      opts.ellipseCY = h / 2;

      star_init();
    });

    star_init();
  }

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
    setWidth(window.innerWidth);
    setHeight(window.innerHeight);
  }

  useLayoutEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d')!;

    initCanvas(ctx);

    return () => {
      ctx.clearRect(0, 0, width, height);
      if (rafId.current > 0) cancelAnimationFrame(rafId.current);
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
