import { useEffect, useRef, useState } from 'react';
import SchoolIcons from '../school/SchoolIcons';
import gBG from 'img/astrark/school/bg_genetic.jpg';
import mBG from 'img/astrark/school/bg_mechanoid.jpg';
import sBG from 'img/astrark/school/bg_spiritual.jpg';
import nBG from 'img/astrark/school/bg_natural.jpg';
import useSketch from '@/hooks/useSketch';
import { Swiper, SwiperSlide, SwiperClass } from 'swiper/react';
import { Mousewheel } from 'swiper/modules';
import { throttle } from 'lodash';
import SchoolStory from './components/SchoolStory';

export default function SchoolDesc() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTouchedBottom, setIsTouchedBottom] = useState(false);
  const swiperRef = useRef<SwiperClass>();

  const throttleSetIisTouchedBottom = throttle((isTB: boolean) => setIsTouchedBottom(isTB), 1000);
  function onLuxyScroll() {
    const { scrollHeight, scrollTop, clientHeight } = document.documentElement;
    const isTB = scrollTop === scrollHeight - clientHeight;
    throttleSetIisTouchedBottom(isTB);
  }

  useEffect(() => {
    window.addEventListener('scroll', onLuxyScroll);
    return () => window.removeEventListener('scroll', onLuxyScroll);
  }, []);

  const images = [gBG.src, mBG.src, sBG.src, nBG.src];
  const { nodeRef: bgContainerRef, sketch } = useSketch<HTMLDivElement>(images);

  function switchSketch(index: number) {
    if (activeIndex === 0 && isTouchedBottom) {
      document.documentElement.style.overflow = 'hidden';
    }
    if (activeIndex === 1 && index === 0) {
      setTimeout(() => {
        document.documentElement.style.overflow = 'unset';
      }, 1000);
    }
    setActiveIndex(index);
    sketch.current?.jumpTo(index);
    swiperRef.current?.slideTo(index, 0);
  }

  function onIconClick(index: number) {
    if (index === activeIndex || sketch.current?.isRunning) return;
    switchSketch(index);
  }

  const changeBySwiper = throttle((index: number) => {
    const nextIndex = (activeIndex + (index > activeIndex ? 1 : -1) + images.length) % images.length;
    switchSketch(nextIndex);
  }, 500);

  function onSlideChange(index: number) {
    if (index === activeIndex || sketch.current?.isRunning) return;
    changeBySwiper(index);
  }

  function onSwiperWheel(e: WheelEvent) {
    e.stopPropagation();
  }

  useEffect(() => {
    return () => {
      document.documentElement.style.overflow = 'unset';
    };
  }, []);

  return (
    <section className="school-desc w-full h-screen relative overflow-hidden">
      <div ref={bgContainerRef} className="w-full h-full"></div>

      <div
        className="absolute left-0 top-0 w-full h-screen overflow-hidden z-10"
        onWheel={(e) => onSwiperWheel(e as any)}
      >
        <Swiper
          modules={[Mousewheel]}
          slidesPerView={1}
          speed={0}
          mousewheel={!sketch.current?.isRunning && { releaseOnEdges: true, thresholdTime: 1200 }}
          direction="horizontal"
          onInit={(swiper) => (swiperRef.current = swiper)}
          onActiveIndexChange={(swiper) => onSlideChange(swiper.realIndex)}
        >
          {images.map((image, index) => (
            <SwiperSlide key={index}>
              <div className="w-screen h-screen"></div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {isTouchedBottom || <div className="absolute left-0 top-0 w-full h-screen overflow-hidden z-20"></div>}

      <SchoolStory activeIndex={activeIndex} />

      <SchoolIcons
        className="absolute left-1/2 bottom-12 -translate-x-1/2 z-20"
        hoverActive
        cursorPointer
        activeIndex={activeIndex}
        onClick={onIconClick}
      />
    </section>
  );
}
