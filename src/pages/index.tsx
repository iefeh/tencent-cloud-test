'use client';

import { createRef, useRef, useState, useEffect } from 'react';
import SwiperScreen from './components/home/SwiperScreen';
import Character from './components/character/character';
import Footer from './components/home/Footer';
import StarScreen from './components/home/StarScreen';
import Head from 'next/head';
import SloganScreen from './components/home/SloganScreen';
import SloganDescScreen from './components/home/SloganDescScreen';
import { Swiper, SwiperClass, SwiperSlide } from 'swiper/react';
import { Mousewheel } from 'swiper/modules';

export default function Home() {
  const scrollWrapper = createRef<HTMLDivElement>();
  const [swiper, setSwiper] = useState<SwiperClass>();
  const [scrollY, setScrollY] = useState(0);

  function onMaskAniEnd() {
    if (!swiper) return;
    swiper.enable();
    swiper.slideNext(0);
    setScrollY(swiper.translate);
  }

  function initSwiper(swiperIns: SwiperClass) {
    setSwiper(swiperIns);
    swiperIns.disable();
  }

  function onSwiperScroll(swiper: SwiperClass, e: WheelEvent) {
    if (swiper.isBeginning) {
      swiper.disable();
    }
    setScrollY(swiper.translate);
  }

  return (
    <section
      ref={scrollWrapper}
      className="page-home scroll-wrapper relative w-full h-screen flex flex-col items-center justify-between overflow-hidden bg-no-repeat bg-fixed bg-origin-border"
    >
      <Head>
        <title>Home | Moonveil</title>
      </Head>

      <Swiper
        className="w-full h-full"
        modules={[Mousewheel]}
        freeMode={{ enabled: true, sticky: false, momentum: true }}
        slidesPerView="auto"
        mousewheel
        direction="vertical"
        onSwiper={initSwiper}
        onScroll={onSwiperScroll}
      >
        <SwiperSlide>
          <SwiperScreen onMaskAniEnd={onMaskAniEnd} />
        </SwiperSlide>

        <SwiperSlide>
          <SloganScreen scrollY={scrollY} />
        </SwiperSlide>

        <SwiperSlide>
          <SloganDescScreen />
        </SwiperSlide>

        <SwiperSlide>
          <div className="overflow-hidden">
            <Character />
          </div>
        </SwiperSlide>

        <SwiperSlide style={{ height: 'auto' }}>
          <Footer />
        </SwiperSlide>
      </Swiper>

      <StarScreen scrollY={scrollY} />
    </section>
  );
}
