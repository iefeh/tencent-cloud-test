'use client';
import { useEffect, useRef, useState } from 'react';
import Video from '../components/common/Video';
import { cn } from '@nextui-org/react';
import S3Image from '@/components/common/medias/S3Image';
import Planet, { type PlanetProps } from '@/components/pages/about/Planet';
import useShake from '@/hooks/useShake';
import Link from '@/components/link';
import MobilePlanet from '@/components/pages/about/MobilePlanet';

const Planets: (PlanetProps & { offsetFX?: number; offsetFY?: number })[] = [
  /* Bushwhack */
  {
    top: 178,
    left: 600,
    width: 96,
    height: 87,
    offsetFX: -1.5,
    offsetFY: 1.2,
    url: '/Bushwhack',
    src: '/about/ecoanimations/planet_br.png',
    getLogo: (fn, className) => (
      <S3Image className={className} src="/about/ecoanimations/logo_br.png" style={{ width: fn(154, 96), aspectRatio: '154/37' }} />
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
    url: '/AstrArk',
    src: '/about/ecoanimations/planet_aa.png',
    getLogo: (fn, className) => (
      <S3Image
        className={cn(['object-contain md:top-5', className])}
        src="/about/ecoanimations/logo_aa.png"
        style={{ width: fn(255, 147), aspectRatio: '255/55' }}
      />
    ),
  },
  /* Mini Games */
  {
    top: 300,
    left: 1305,
    width: 61,
    height: 60,
    offsetFX: -3,
    offsetFY: 1.7,
    url: '/minigames',
    src: '/about/ecoanimations/planet_other.png',
    getLogo: (fn, className) => (
      <div className={cn(['flex items-center gap-x-3 w-max', className])}>
        <S3Image className="object-contain w-8 h-8" src="/about/ecoanimations/minigames.png" />

        <span>Mini Games</span>
      </div>
    ),
  },
  /* Flaming Pets */
  {
    top: 360,
    left: 1062,
    width: 87,
    height: 86,
    offsetFX: -2,
    offsetFY: 1.7,
    src: '/about/ecoanimations/planet_badge.png',
    getLogo: (fn, className) => (
      <div className={cn(['flex md:flex-col items-center gap-x-2 gap-y-1 w-max', className])}>
        <S3Image className="object-contain w-24" src="/about/ecoanimations/flaming_pets.png" />

        <div>Flaming Pets</div>
      </div>
    ),
  },

  /* Loyalty Program */
  {
    top: 404,
    left: 437,
    width: 33,
    height: 33,
    offsetFX: -2.4,
    offsetFY: 1.4,
    url: '/LoyaltyProgram/intro',
    src: '/about/ecoanimations/planet_hceb.png',
    getLogo: (fn, className) => (
      <span className={className}>
        Loyalty Program
        <br />
        (Moon Beams)
      </span>
    ),
  },
  /** Badge & Identity SBT' */
  {
    top: 485,
    left: 750,
    width: 38,
    height: 37,
    offsetFX: 2.2,
    offsetFY: -1.6,
    url: '/Profile/MyBadges',
    src: '/about/ecoanimations/planet_mb.png',
    label: 'Badge & Identity SBT',
  },
  /* AI Automatic Game Dev Tool */
  {
    top: 568,
    left: 982,
    width: 51,
    height: 50,
    offsetFX: 1.8,
    offsetFY: 1.6,
    src: '/about/ecoanimations/planet_vcm.png',
    label: 'AI Automatic Game Dev Tool',
  },
  /* AI Agent */
  {
    top: 610,
    left: 1282,
    width: 51,
    height: 50,
    offsetFX: 1.8,
    offsetFY: 1.6,
    src: '/about/ecoanimations/planet_cdk.png',
    label: 'AI Agent',
  },
  /* Integrated Wallets */
  {
    top: 600,
    left: 360,
    width: 35,
    height: 34,
    offsetFX: 2.8,
    offsetFY: 1.8,
    src: '/about/ecoanimations/planet_cdk.png',
    label: 'Integrated Wallets',
  },
  /* Highly customizableenvironment for builders */
  {
    top: 740,
    left: 720,
    width: 51,
    height: 50,
    offsetFX: -2.3,
    offsetFY: 2,
    src: '/about/ecoanimations/planet_hceb.png',
    getLogo: (fn, className) => (
      <span className={className}>
        Customizable
        <br />
        Environment for Builders
      </span>
    ),
  },
  /* Unified Liquidity */
  {
    top: 787,
    left: 1200,
    width: 35,
    height: 34,
    offsetFX: -2.3,
    offsetFY: 2.3,
    src: '/about/ecoanimations/planet_unified.png',
    label: 'Unified Liquidity',
  },
  /* Top Quality Games */
  {
    top: 300,
    left: 1600,
    width: 35,
    height: 34,
    offsetFX: -2.3,
    offsetFY: 2.3,
    isSrcText: true,
    src: 'Top Quality Games',
    getLogo: (fn, className) => (
      <div className={cn(['md:!-right-14 text-3xl text-basic-yellow', className])}>Product Layer</div>
    ),
  },
  /* OPS & Identity Layer */
  {
    top: 560,
    left: 1700,
    width: 35,
    height: 34,
    offsetFX: -2.3,
    offsetFY: 2.3,
    isSrcText: true,
    src: 'AI-Powered Neural Network',
    getLogo: (fn, className) => (
      <div className={cn(['md:!-right-[5.75rem] text-3xl text-basic-yellow', className])}>OPS & Identity Layer</div>
    ),
  },
  /* OPS & Identity Layer */
  {
    top: 800,
    left: 1656,
    width: 35,
    height: 34,
    offsetFX: -2.3,
    offsetFY: 2.3,
    isSrcText: true,
    src: 'Moonveil L2 Chain',
    getLogo: (fn, className) => (
      <div className={cn(['md:!-right-14 text-3xl text-basic-yellow text-right', className])}>Infra Layer</div>
    ),
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
      <div className="planet-container aspect-[1920/1080] absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full">
        <Video
          className="absolute inset-0"
          options={{
            controls: false,
            bigPlayButton: false,
            sources: [
              {
                src: 'https://d3dhz6pjw7pz9d.cloudfront.net/about/ECOSYSTEM+LOOP.webm',
                type: 'video/webm',
              },
            ],
          }}
        />

        <div className="absolute left-0 bottom-0 z-0">
          <S3Image
            ref={shakeRef1}
            className="w-[25.875rem] h-[49.75rem] object-contain"
            src="/about/ecoanimations/nebula_lb.png"
          />
        </div>

        <div className="absolute right-0 top-0 z-0">
          <S3Image
            ref={shakeRef2}
            className="w-[34.375rem] h-[33.25rem] object-contain"
            src="/about/ecoanimations/nebula_tr.png"
          />
        </div>
      </div>

      <div
        className={cn([
          'planet-container',
          'md:aspect-[1920/1080] relative',
          // isWidthMore ? 'h-full' : 'w-full',
          'w-full max-h-full overflow-auto py-32 px-12',
        ])}
      >
        {Planets.map((planet, index) => (
          <Link key={index} href={planet.url || ''} className="w-full md:w-[unset]">
            <Planet className="hidden md:block" {...planet} />

            <MobilePlanet className="md:hidden" {...planet} />
          </Link>
        ))}
      </div>
    </div>
  );
}
