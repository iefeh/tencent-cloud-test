import { LotteryRewardType } from '@/constant/lottery';
import useFrameAni from '@/hooks/useFrameAni';
import { Lottery } from '@/types/lottery';
import Image from 'next/image';
import { FC } from 'react';
import { cn } from '@nextui-org/react';
import styles from './index.module.css';
import usePrizeAni, { rewardConfigs } from '../hooks/usePrizeAni';

const PlanetAni: FC<ItemProps<Lottery.Pool>> = ({ item }) => {
  const { canvasRef, width, height } = useFrameAni({
    width: 1920,
    height: 1076,
    url: 'https://d3dhz6pjw7pz9d.cloudfront.net/lottery/planet_ani.zip',
    cover: 'https://d3dhz6pjw7pz9d.cloudfront.net/lottery/planet_ani_cover.png',
    count: 288,
    nameFn: (i) => `planet_${i.toString().padStart(5, '0')}.png`,
  });

  const { prizeList } = usePrizeAni({ item });

  return (
    <div className="w-full h-full flex justify-center items-center">
      <canvas ref={canvasRef} className="object-contain"></canvas>

      <div
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

        {prizeList.map((r, i) => {
          const idx = i % rewardConfigs.length;
          const config = rewardConfigs[idx];

          return (
            <div
              key={i}
              id={`pool_prize_${i}`}
              className={cn([
                'w-10 h-10 lg:w-32 lg:h-32 absolute left-1/2 right-1/2 -translate-x-1/2 -translate-y-1/2',
              ])}
            >
              <div
                className="w-full h-full flex justify-center items-center relative origin-center"
                style={{ transform: `scale(${config.size})` }}
              >
                <Image
                  className="object-contain"
                  src="https://d3dhz6pjw7pz9d.cloudfront.net/lottery/bg_prize.png"
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

      {/* <div className="absolute left-1/2 top-1/2 -translate-x-[calc(50%_+_21.5625rem)] -translate-y-[calc(50%_+_3.3125rem)] flex flex-col items-center">
        <Image
          className="object-contain w-[11.4375rem] h-[3.4375rem]"
          src="https://d3dhz6pjw7pz9d.cloudfront.net/lottery/still_in_prize_pool.png"
          alt=""
          width={183}
          height={55}
          unoptimized
        />

        <Image
          className="object-contain w-[12.8125rem] h-[10.4375rem]"
          src="https://d3dhz6pjw7pz9d.cloudfront.net/lottery/special_prize.png"
          alt=""
          width={205}
          height={167}
          unoptimized
        />
      </div> */}
    </div>
  );
};

export default PlanetAni;
