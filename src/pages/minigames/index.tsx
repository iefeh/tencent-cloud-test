import FloatTips from '@/components/pages/minigames/home/FloatTips';
import GameTabs from '@/components/pages/minigames/home/GameTabs';
import GameCollection from '@/components/pages/minigames/home/GameTabs/GameCollection';
import CollectionWarpper from '@/components/pages/minigames/home/GameTabs/CollectionWarpper';
import GameTitle from '@/components/pages/minigames/home/GameTabs/GameTitle';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperEl from 'swiper';
import { Mousewheel, FreeMode } from 'swiper/modules';
import Head from 'next/head';
import { FC, useState, CSSProperties, useRef, useEffect, useMemo } from 'react';
import 'swiper/css';
import { isMobile } from 'react-device-detect';

export const aniSpeed = 2000
const swiperSpeed = 2000;

const MiniGamesPage: FC & BasePage = () => {
  const [selectedKey, setSelectedKey] = useState('');
  const [swiperIndex, setSwiperIndex] = useState<number | null>(null);

  const animationRef = useRef<boolean>(false)
  const indexRef = useRef<number | null>(0)
  let swiperRef = useRef<SwiperEl | null>(null);

  const isFristScreen = () => [null, 0].includes(indexRef.current)

  const disableSlider = () => {
    if (!swiperRef.current) return
    swiperRef.current.allowSlideNext = false;
    swiperRef.current.allowSlidePrev = false;
  }

  const enableSlider = () => {
    if (!swiperRef.current) return
    swiperRef.current.allowSlideNext = true;
    swiperRef.current.allowSlidePrev = true;
  }

  useEffect(() => {
    if (isMobile) return
    if (!swiperRef.current) return

    const dom = swiperRef.current.el
    dom.addEventListener('wheel', handleMouseWheel);

    return () => {
      dom.removeEventListener('wheel', handleMouseWheel)
    }
  }, [])

  const promiseFn = (cb: () => void, time: number) => {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        cb()
        resolve(true)
        clearTimeout(timeout)
      }, time)
    })
  }

  const handleMouseWheel = async (event: WheelEvent) => {
    if (!swiperRef.current || animationRef.current) return

    // 向下滚动
    if (event.deltaY > 0 && isFristScreen()) {
      disableSlider()
      animationRef.current = true
      setSwiperIndex(1)

      await promiseFn(
        () => {
          if (!swiperRef.current) return
          swiperRef.current.allowSlideNext = true;
          swiperRef.current.slideNext();
        }, aniSpeed - 800
      )

      await promiseFn(
        () => {
          animationRef.current = false
          enableSlider()
        },
        swiperSpeed
      )
    }

    // 向上滚动
    if (event.deltaY < 0) {
      disableSlider()
      animationRef.current = true
      await promiseFn(() => {
        if (!swiperRef.current) return
        enableSlider()
        animationRef.current = false
      }, aniSpeed)
    }
  }

  useEffect(() => {
    indexRef.current = swiperIndex
    if (isFristScreen()) {
      setTimeout(() => {
        swiperRef.current && disableSlider();
      }, aniSpeed + 10)
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
        className="w-full h-[110vh] relative z-20"
        modules={[Mousewheel, FreeMode]}
        mousewheel={true}
        direction="vertical"
        speed={swiperSpeed}
        freeMode={isMobile}
        scrollbar={{ draggable: true }}
        slidesPerView="auto"
        spaceBetween={0}
        allowSlideNext={false}
        allowSlidePrev={false}
        onSlideChangeTransitionStart={(swiper) => {
          setSwiperIndex(swiper.realIndex);
        }}
        onSlideChangeTransitionEnd={(swiper) => {
          setSwiperIndex(swiper.realIndex);
        }}
        onSwiper={(swiper) => swiperRef.current = swiper}
      >
        <SwiperSlide className="releative !p-0 z-20 !h-auto" key="title1">
          <GameTitle animation={animationRef.current} swiperIndex={swiperIndex} />
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
