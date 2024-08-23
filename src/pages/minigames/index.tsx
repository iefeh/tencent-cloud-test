import FloatTips from '@/components/pages/minigames/home/FloatTips';
import GameTabs from '@/components/pages/minigames/home/GameTabs';
import GameCollection from '@/components/pages/minigames/home/GameTabs/GameCollection';
import CollectionWarpper from "@/components/pages/minigames/home/GameTabs/CollectionWarpper"
import GameTitle from '@/components/pages/minigames/home/GameTabs/GameTitle';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Mousewheel, FreeMode } from 'swiper/modules';
import Head from 'next/head';
import { FC, useState, useRef, useEffect } from 'react';

import 'swiper/css';


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
        speed={1300}
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
        <SwiperSlide className='releative !p-0 z-20 !h-auto' key='title1'>
          <GameTitle swiperIndex={swiperIndex} />
          <FloatTips />
        </SwiperSlide>

        <SwiperSlide className='releative !p-0 !h-auto mt-[1.5rem] z-10' key='tabs2'>
          <GameTabs
            className="absolute z-20 left-1/2 -translate-x-1/2 -translate-y-1/2"
            value={selectedKey}
            onSelectionChange={setSelectedKey}
          />
          <CollectionWarpper>
            <GameCollection type={selectedKey} />
          </CollectionWarpper>
        </SwiperSlide>
      </Swiper>

    </section >
  );
};

MiniGamesPage.hasNavMask = true;

export default MiniGamesPage;
