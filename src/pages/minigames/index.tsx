import FloatTips from '@/components/pages/minigames/home/FloatTips';
import GameTabs from '@/components/pages/minigames/home/GameTabs';
import GameCollection from '@/components/pages/minigames/home/GameTabs/GameCollection';
import CollectionWarpper from '@/components/pages/minigames/home/GameTabs/CollectionWarpper';
import GameTitle from '@/components/pages/minigames/home/GameTabs/GameTitle';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Mousewheel, FreeMode } from 'swiper/modules';
import Head from 'next/head';
import { FC, useState, CSSProperties } from 'react';

import 'swiper/css';
import { isMobile } from 'react-device-detect';
export const swiperSpeed = 2000;

const MiniGamesPage: FC & BasePage = () => {
  const [selectedKey, setSelectedKey] = useState('');
  const [swiperIndex, setSwiperIndex] = useState<number | null>(null);

  return (
    <section className="relative flex flex-col items-center font-jcyt6 w-screen text-brown">
      <Head>
        <link
          rel="preload"
          as="font"
          href="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/fonts/jiangchengyuanti600W.ttf"
          crossOrigin="anonymous"
        ></link>
        <link
          rel="preload"
          as="font"
          href="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/fonts/jiangchengyuanti400W.ttf"
          crossOrigin="anonymous"
        ></link>
      </Head>

      <Swiper
        className="w-full h-[110vh] relative z-20"
        modules={[Mousewheel, FreeMode]}
        mousewheel={true}
        direction="vertical"
        speed={swiperSpeed}
        freeMode={isMobile}
        scrollbar={{ draggable: true }}
        slidesPerView="auto"
        spaceBetween={0}
        onSlideChangeTransitionStart={(swiper) => {
          setSwiperIndex(swiper.realIndex);
        }}
        onSlideChangeTransitionEnd={(swiper) => {
          setSwiperIndex(swiper.realIndex);
        }}
      >
        <SwiperSlide className="releative !p-0 z-20 !h-auto" key="title1">
          <GameTitle swiperIndex={swiperIndex} />
          <FloatTips />
        </SwiperSlide>

        <SwiperSlide className="releative !p-0 !h-auto mt-[1.5rem] z-10" key="tabs2">
          <CollectionWarpper>
            <div
              className="stroke-content lg:text-5xl text-4xl text-white text-center"
              style={{ '--stroke-color': '#403930', '--stroke-width': '2px' } as CSSProperties}
            >
              Moonveil Mini Games
            </div>
            <GameTabs
              className="my-[1rem]"
              value={selectedKey}
              onSelectionChange={setSelectedKey}
            />
            <GameCollection type={selectedKey} />
          </CollectionWarpper>
        </SwiperSlide>
      </Swiper>
    </section>
  );
};

MiniGamesPage.hasNavMask = true;

export default MiniGamesPage;
