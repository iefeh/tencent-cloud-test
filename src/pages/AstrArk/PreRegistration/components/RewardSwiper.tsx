import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Mousewheel } from 'swiper/modules';
import shardBgImg from 'img/astrark/pre-register/bg_reward_shard.jpg';
import packageBgImg from 'img/astrark/pre-register/bg_reward_package.jpg';
import shardRewardImg from 'img/astrark/pre-register/reward_shard.png';
import packageRewardImg from 'img/astrark/pre-register/reward_package.png';
import Image from 'next/image';
import { cn } from '@nextui-org/react';

const enum RewardType {
  SHARD,
  PACKAGE,
}

interface RewardItem {
  target: string;
  type: RewardType;
  desc: string;
  reached?: boolean;
}

export default function RewardSwiper() {
  const [rewards, setRewards] = useState<RewardItem[]>([
    {
      target: '10k',
      type: RewardType.SHARD,
      desc: 'Perth Shard X 300',
      reached: true,
    },
    {
      target: '50k',
      type: RewardType.PACKAGE,
      desc: 'Perth Shard X 300<br./>Fuel package(small) X 4<br/>Mysterious',
    },
    {
      target: '100k',
      type: RewardType.PACKAGE,
      desc: "Exceptional Crew's Chest X 1",
    },
    {
      target: '500k',
      type: RewardType.PACKAGE,
      desc: 'Immortal Crew Chest X 1<br/>Fuel package(medium) X 4',
    },
  ]);

  return (
    <Swiper
      className="max-w-[25rem] lg:max-w-[69.25rem] relative shrink-0 select-none"
      wrapperClass="p-8"
      modules={[FreeMode, Mousewheel]}
      mousewheel={true}
      direction="horizontal"
      slidesPerView={window?.innerWidth >= 1024 ? 4 : 1.5}
      freeMode={true}
      spaceBetween="2.375rem"
    >
      {rewards.map((item, index) => (
        <SwiperSlide key={index} className="relative">
          <div
            className={cn([
              'w-60 h-80 relative box-border rounded-base origin-center transition-transform hover:scale-110 z-20',
              index > 0 && rewards[index - 1].reached
                ? 'border-3 border-basic-yellow shadow-[0_0_16px_1px_rgba(246,199,153,0.6)]'
                : 'border-2 border-[rgba(255,255,255,0.1)]',
            ])}
          >
            <Image
              className="rounded-base"
              src={item.type === RewardType.SHARD ? shardBgImg : packageBgImg}
              alt=""
              fill
            />

            <div className="relative z-0 flex flex-col items-center pt-8 h-full">
              <span
                className={cn([
                  'font-semakin text-4xl inline-flex items-center h-[2.625rem] gap-3 rounded-[1.3625rem] px-[1.625rem] text-[rgb(99,95,93)]',
                  index > 0 && rewards[index - 1].reached && 'bg-[rgba(49,40,32)] !text-basic-yellow',
                  item.reached && '!text-basic-yellow',
                ])}
              >
                <span className="inline-block overflow-hidden w-[0.4375rem] h-[0.4375rem] rounded-full bg-current -mt-1"></span>
                <span className="relative top-[0.125rem]">{item.target}</span>
                <span className="inline-block overflow-hidden w-[0.4375rem] h-[0.4375rem] rounded-full bg-current -mt-1"></span>
              </span>

              <Image
                className="mt-9 w-[11.875rem] h-[6.25rem] object-cover"
                src={item.type === RewardType.SHARD ? shardRewardImg : packageRewardImg}
                alt=""
              />

              <div className="mt-6 w-full h-[0.0625rem] bg-gradient-to-r from-transparent via-[rgba(246,199,153,0.3)] to-transparent"></div>

              <div
                className="flex-1 flex flex-col items-center justify-center text-[#7c7c7c] text-sm leading-[1.125rem] font-poppins"
                dangerouslySetInnerHTML={{ __html: item.desc }}
              ></div>
            </div>
          </div>

          {index < rewards.length - 1 && (
            <div className="absolute -right-[0.1875rem] top-1/2 -translate-y-1/2 w-[calc(100%_-_14.8125rem)] h-[0.3125rem] bg-basic-yellow"></div>
          )}
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
