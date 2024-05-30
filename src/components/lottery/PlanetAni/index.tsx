import { LotteryRewardType } from '@/constant/lottery';
import useFrameAni from '@/hooks/useFrameAni';
import { Lottery } from '@/types/lottery';
import Image from 'next/image';
import { FC, useEffect, useRef } from 'react';
import { cn } from '@nextui-org/react';
import styles from './index.module.css';

const points = [
  [
    [420, 472],
    [384, 496],
  ],
  [
    [302, 561],
    [381, 587],
  ],
  [
    [381, 587],
    [559, 620],
  ],
  [
    [900, 630],
    [960, 604],
  ],
  [
    [1200, 560],
    [1376, 498],
  ],
  [
    [1540, 460],
    [1525, 369],
  ],
  [
    [1520, 320],
    [1317, 304],
  ],
  [
    [1317, 305],
    [935, 320],
  ],
  [
    [935, 305],
    [465, 451],
  ],
];

const idxs: number[] = [];

function getPath(start = 0) {
  const curPoints = points.slice(start).concat(points.slice(0, start));
  const lastPairs = curPoints[curPoints.length - 1];
  const startPoints = lastPairs[lastPairs.length - 1];
  const paths = curPoints
    .map((p) => {
      const flag = p.length === 2 ? 'Q' : 'C';
      return flag + p.map((pi) => pi.join(',')).join();
    })
    .join(' ');

  return `M${startPoints.join(',')} ${paths} z`;
}

const rewardConfigs = [
  {
    speed: 1,
    size: 1,
    path: '',
  },
  {
    speed: 1,
    size: 0.8,
  },
  {
    speed: 1,
    size: 0.85,
  },
  {
    speed: 1,
    size: 0.7,
  },
  {
    speed: 1,
    size: 0.9,
  },
  {
    speed: 1,
    size: 0.6,
  },
].map((c, i) => {
  let idx = 0;

  do {
    idx = Math.floor(Math.random() * points.length);
  } while (idxs.length < points.length && idxs.includes(idx));

  idxs.push(idx);

  c.path = getPath(idx);
  return c;
});

const PlanetAni: FC<ItemProps<Lottery.Pool>> = ({ item }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { canvasRef, width, height } = useFrameAni({
    width: 1920,
    height: 1076,
    url: 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/lottery/planet_ani.zip',
    cover: 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/lottery/planet_ani_cover.png',
    count: 288,
    nameFn: (i) => `planet_${i.toString().padStart(5, '0')}.png`,
  });

  useEffect(() => {
    if ((item?.rewards?.length || 0) < 1) return;

    Promise.all([import('gsap'), import('gsap/MotionPathPlugin')]).then(([{ Linear, gsap }, { MotionPathPlugin }]) => {
      gsap.registerPlugin(MotionPathPlugin);

      (item?.rewards || []).forEach((r, i) => {
        if (r.reward_type === LotteryRewardType.NoPrize) return;

        const idx = i % rewardConfigs.length;
        const pathId = `#path_prize_ellipse_${idx}`;
        const config = rewardConfigs[idx];

        gsap.to(`#pool_prize_${i}`, {
          duration: 14 * config.speed,
          repeat: -1,
          ease: Linear.easeNone,
          motionPath: {
            path: pathId,
            align: pathId,
            autoRotate: false,
            alignOrigin: [0.5, 0.5],
          },
        });
      });
    });
  }, [item?.rewards]);

  return (
    <div className="w-full h-full flex justify-center items-center">
      <canvas ref={canvasRef} className="object-contain"></canvas>

      <div
        ref={containerRef}
        className={cn(['absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2', styles.prizeContianer])}
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        <svg
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          viewBox={`0 0 1920 1076`}
          width="100%"
          height="100%"
        >
          {rewardConfigs.map((config, index) => (
            <path key={index} id={`path_prize_ellipse_${index}`} fill="none" stroke="transparent" d={config.path} />
          ))}
        </svg>

        {(item?.rewards || []).map((r, i) => {
          if (r.reward_type === LotteryRewardType.NoPrize) return null;

          const idx = i % rewardConfigs.length;
          const config = rewardConfigs[idx];

          return (
            <div
              key={i}
              id={`pool_prize_${i}`}
              className={cn(['w-32 h-32 absolute left-1/2 right-1/2 -translate-x-1/2 -translate-y-1/2'])}
            >
              <div
                className="w-full h-full flex justify-center items-center relative origin-center"
                style={{ transform: `scale(${config.size})` }}
              >
                <Image
                  className="object-contain"
                  src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/lottery/bg_prize.png"
                  alt=""
                  fill
                  sizes="100%"
                  unoptimized
                />

                <Image
                  className="w-[70%] h[70%] object-contain relative z-0"
                  src={r.icon_url}
                  alt=""
                  width={128}
                  height={128}
                  unoptimized
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlanetAni;
