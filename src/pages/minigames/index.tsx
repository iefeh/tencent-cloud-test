import FloatTips from '@/components/pages/minigames/home/FloatTips';
import GameTabs from '@/components/pages/minigames/home/GameTabs';
import GameCollection from '@/components/pages/minigames/home/GameTabs/GameCollection';
import CollectionWarpper from "@/components/pages/minigames/home/GameTabs/CollectionWarpper"
import GameTitle from '@/components/pages/minigames/home/GameTabs/GameTitle';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore from 'swiper';
import { Mousewheel } from 'swiper/modules';
import Head from 'next/head';
import { FC, useState, useRef, useEffect } from 'react';

import 'swiper/css';


const MiniGamesPage: FC & BasePage = () => {
  const [selectedKey, setSelectedKey] = useState('');
  const [swiperIndex, setSwiperIndex] = useState<number | null>(null);
  const [animation, setAnimation] = useState(false)

  const swiperRef = useRef<SwiperCore | null>(null);

  useEffect(() => {
    document.addEventListener('wheel', (event) => {
      if (animation) return

      if (event.deltaY > 0) {
        setAnimation(true)

        setTimeout(() => {
          if (swiperRef.current) {
            if (event.deltaY > 0) {
              swiperRef.current.allowSlideNext = true;
              swiperRef.current.slideNext();
            }
          }
        }, 1000)
        setSwiperIndex(1)
      }
    })
  }, [])

  useEffect(() => {
    if (swiperIndex === 0) {
      swiperRef.current && (swiperRef.current.allowSlideNext = false);
    }
  }, [swiperIndex])

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
        className="w-full h-[110vh]"
        modules={[Mousewheel]}
        mousewheel={{
          sensitivity: 1,
          releaseOnEdges: true,
        }}
        direction="vertical"
        speed={3000}
        slidesPerView={1}
        spaceBetween={0}
        allowSlideNext={false}
        onSlideChangeTransitionStart={(swiper) => {
          setAnimation(true)
          setSwiperIndex(swiper.realIndex);
        }}
        onSlideChangeTransitionEnd={(swiper) => {
          setAnimation(false)
          swiper.allowSlideNext = true;

          setTimeout(() => {
            swiper.allowSlideNext = false;
          }, 100);

          setSwiperIndex(swiper.realIndex);
          setAnimation(false)
        }}
        onSwiper={(swiper) => (swiperRef.current = swiper)}
      >
        <SwiperSlide className='releative !p-0 h-[100vh]' key='title1'>
          <GameTitle swiperIndex={swiperIndex} />
          <FloatTips />

        </SwiperSlide>

        <SwiperSlide className='releative !p-0 mt-[14rem] h-[90vh]' key='tabs2'>
          <GameTabs
            className="absolute z-20 top-[-5rem] left-1/2 -translate-x-1/2"
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
