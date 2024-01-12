import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Image from 'next/image';
import SchoolIcons from '../school/SchoolIcons';
import gBG from 'img/astrark/school/bg_genetic.jpg';
import mBG from 'img/astrark/school/bg_mechanoid.jpg';
import sBG from 'img/astrark/school/bg_spiritual.jpg';
import nBG from 'img/astrark/school/bg_natural.jpg';
import useSketch from '@/hooks/useSketch';
import { Swiper, SwiperSlide, SwiperClass } from 'swiper/react';
import { Mousewheel } from 'swiper/modules';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import { throttle } from 'lodash';

export default function SchoolDesc() {
  const [activeIndex, setActiveIndex] = useState(0);
  const nodeRef = useRef<HTMLDivElement>(null);
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

  const swipers = [
    {
      name: 'genetic',
      homeplanet: 'zenith',
      bg: gBG,
    },
    {
      name: 'mechanoid',
      homeplanet: 'hyperborea',
      bg: mBG,
    },
    {
      name: 'spiritual',
      homeplanet: 'aeon',
      bg: sBG,
    },
    {
      name: 'natural',
      homeplanet: 'aurora',
      bg: nBG,
    },
  ];
  const { nodeRef: bgContainerRef, sketch } = useSketch<HTMLDivElement>(swipers.map((item) => item.bg.src));

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
    const nextIndex = (activeIndex + (index > activeIndex ? 1 : -1) + swipers.length) % swipers.length;
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

      <div className="school w-full h-screen absolute left-0 top-0 z-10">
        <SwitchTransition mode="out-in">
          <CSSTransition classNames="desc" nodeRef={nodeRef} key={activeIndex} timeout={800} unmountOnExit>
            {() => (
              <div
                ref={nodeRef}
                className="desc uppercase absolute w-[29.3125rem] h-[11.25rem] left-[18.75%] top-[27.25%] border-[#F4C699] border-l-[3px] px-[2.625rem] pt-[2.625rem] pb-[3rem] box-border max-md:hidden"
              >
                <div className="flex items-center">
                  <div className="w-[3.875rem] h-[3.875rem] relative">
                    <Image
                      className="object-cover"
                      src={`/img/astrark/school/${swipers[activeIndex].name}.png`}
                      alt=""
                      fill
                    />
                  </div>

                  <div className="h-12 uppercase text-5xl font-semakin ml-[0.625rem] leading-[3.875rem]">
                    {swipers[activeIndex].name}
                  </div>
                </div>

                <div className="font-semakin text-2xl text-basic-yellow mt-3">
                  Home Planet : {swipers[activeIndex].homeplanet}
                </div>
              </div>
            )}
          </CSSTransition>
        </SwitchTransition>
      </div>

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
          {swipers.map((swiper, index) => (
            <SwiperSlide key={index}>
              <div className="w-screen h-screen"></div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {isTouchedBottom || <div className="absolute left-0 top-0 w-full h-screen overflow-hidden z-20"></div>}

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
