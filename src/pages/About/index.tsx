'use client';
import { useEffect, useRef, useState } from 'react';
import Video from '../components/common/Video';
import { cn } from '@nextui-org/react';
import S3Image from '@/components/common/medias/S3Image';
import Planet, { type PlanetProps } from '@/components/pages/about/Planet';
import useShake from '@/hooks/useShake';

const Planets: (PlanetProps & { offsetFX?: number; offsetFY?: number })[] = [
  /* Bushwhack */
  {
    top: 156,
    left: 752,
    width: 96,
    height: 87,
    offsetFX: -1.5,
    offsetFY: 1.2,

    src: '/about/ecoanimations/planet_br.png',
    getLogo: (fn) => (
      <S3Image src="/about/ecoanimations/logo_br.png" style={{ width: fn(154, 96), aspectRatio: '154/37' }} />
    ),
  },
  /* AstrArk */
  {
    top: 279,
    left: 783,
    width: 147,
    height: 133,
    offsetFX: 1.8,
    offsetFY: -1.5,
    src: '/about/ecoanimations/planet_aa.png',
    getLogo: (fn, className) => (
      <S3Image
        className={cn(['object-contain top-5', className])}
        src="/about/ecoanimations/logo_aa.png"
        style={{ width: fn(255, 147), aspectRatio: '255/55' }}
      />
    ),
  },
  /* Other Games */
  {
    top: 291,
    left: 1268,
    width: 61,
    height: 60,
    offsetFX: -3,
    offsetFY: 1.7,
    src: '/about/ecoanimations/planet_other.png',
    label: 'Other Games',
  },
  /* Mini-Games */
  {
    top: 404,
    left: 437,
    width: 33,
    height: 33,
    offsetFX: -2.4,
    offsetFY: 1.4,
    src: '/about/ecoanimations/planet_minigames.png',
    label: 'Mini-Games',
  },
  /* Badge System */
  {
    top: 485,
    left: 604,
    width: 38,
    height: 37,
    offsetFX: 2.2,
    offsetFY: -1.6,
    src: '/about/ecoanimations/planet_badge.png',
    label: 'Badge System',
  },
  /* Moon Beams */
  {
    top: 550,
    left: 762,
    width: 43,
    height: 42,
    offsetFX: -2,
    offsetFY: 1.7,
    src: '/about/ecoanimations/planet_mb.png',
    label: 'Moon Beams',
  },
  /* Value Capture Mechanism */
  {
    top: 546,
    left: 982,
    width: 51,
    height: 50,
    offsetFX: 1.8,
    offsetFY: 1.6,
    src: '/about/ecoanimations/planet_vcm.png',
    label: 'Value Capture Mechanism',
  },
  /* CDK Chain */
  {
    top: 541,
    left: 204,
    width: 35,
    height: 34,
    offsetFX: 2.8,
    offsetFY: 1.8,
    src: '/about/ecoanimations/planet_cdk.png',
    label: 'CDK Chain',
  },
  /* Highly customizableenvironment for builders */
  {
    top: 683,
    left: 461,
    width: 51,
    height: 50,
    offsetFX: -2.3,
    offsetFY: 2,
    src: '/about/ecoanimations/planet_hceb.png',
    getLogo: (fn, className) => (
      <span className={className}>
        Highly customizable
        <br />
        environment for builders
      </span>
    ),
  },
  /* Seamless UX & interoperability for gamers */
  {
    top: 787,
    left: 800,
    width: 51,
    height: 50,
    offsetFX: 1.88,
    offsetFY: -2.4,
    src: '/about/ecoanimations/planet_ux.png',
    getLogo: (fn, className) => (
      <span className={className}>
        Seamless UX
        <br />& interoperability for gamers
      </span>
    ),
  },
  /* Unified and frictionless liquidity */
  {
    top: 787,
    left: 1200,
    width: 35,
    height: 34,
    offsetFX: -2.3,
    offsetFY: 2.3,
    src: '/about/ecoanimations/planet_unified.png',
    label: 'Unified and frictionless liquidity',
  },
];

export default function About() {
  const [isWidthMore, setIsWidthMore] = useState(true);
  const shakeRef1 = useRef<HTMLImageElement>(null);
  const shakeRef2 = useRef<HTMLImageElement>(null);

  useShake(shakeRef1);
  useShake(shakeRef2);

  function onResize() {
    const { innerWidth, innerHeight } = window;
    // 1920 / 1080
    setIsWidthMore(innerWidth / innerHeight > 1.777778);
  }

  function onMouseMove(e: MouseEvent) {
    const { x, y } = e;
    const { innerWidth, innerHeight } = window;
    const osx = (x - innerWidth / 2) / 20;
    const osy = (y - innerHeight / 2) / 20;
    document.querySelectorAll<HTMLElement>('.planet-container .planet').forEach((node, index) => {
      const { offsetFX = 1, offsetFY = 1 } = Planets[index];
      const tx = osx * offsetFX;
      const ty = osy * offsetFY;

      node.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
    });
  }

  useEffect(() => {
    // window.addEventListener('resize', onResize);
    // window.addEventListener('mousemove', onMouseMove);

    return () => {
      // window.removeEventListener('resize', onResize);
      // window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <div className="w-screen h-screen flex items-center justify-center select-none">
      <div
        className={cn([
          'planet-container',
          'aspect-[1920/1080] relative',
          // isWidthMore ? 'h-full' : 'w-full',
          'w-full',
        ])}
      >
        <Video
          className="w-full h-full"
          options={{
            controls: false,
            bigPlayButton: false,
            sources: [
              {
                src: 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/about/ECOSYSTEM+LOOP.webm',
                type: 'video/webm',
              },
            ],
          }}
        />

        <div className="absolute left-0 bottom-0 z-10">
          <S3Image
            ref={shakeRef1}
            className="w-[25.875rem] h-[49.75rem] object-contain"
            src="/about/ecoanimations/nebula_lb.png"
          />
        </div>

        <div className="absolute right-0 top-0 z-10">
          <S3Image
            ref={shakeRef2}
            className="w-[34.375rem] h-[33.25rem] object-contain"
            src="/about/ecoanimations/nebula_tr.png"
          />
        </div>

        {Planets.map((planet, index) => (
          <Planet key={index} {...planet} />
        ))}
      </div>
    </div>
  );
}
