import { LotteryRewardType } from '@/constant/lottery';
import { Lottery } from '@/types/lottery';
import { useEffect, useState } from 'react';

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

export const rewardConfigs = [
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

export default function usePrizeAni({ item }: ItemProps<Lottery.Pool>) {
  const [prizeList, setPrizeList] = useState<Lottery.RewardItem[]>([]);

  useEffect(() => {
    if ((item?.rewards?.length || 0) < 1) {
      setPrizeList([]);
      return;
    }

    Promise.all([import('gsap'), import('gsap/MotionPathPlugin')]).then(([{ Linear, gsap }, { MotionPathPlugin }]) => {
      gsap.registerPlugin(MotionPathPlugin);

      const map = new Map<LotteryRewardType, Lottery.RewardItem>();

      (item?.rewards || []).forEach((r) => {
        if (r.reward_type === LotteryRewardType.NoPrize) return;

        map.set(r.reward_type, r);
      });

      const list = Array.from(map.values());
      setPrizeList(list);

      setTimeout(() => {
        list.forEach((r, i) => {
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
      }, 100);
    });
  }, [item?.rewards]);

  return { prizeList };
}
