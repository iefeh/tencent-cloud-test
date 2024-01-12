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
import intros from './index.json';
import BasicButton from '@/pages/components/common/BasicButton';
import { Modal, ModalBody, ModalContent, useDisclosure } from '@nextui-org/react';
import PageDesc from '@/pages/components/common/PageDesc';
import circelImg from 'img/astrark/school/circel.png';
import arrowBackImg from 'img/astrark/school/arrow_back.png';

export default function SchoolDesc() {
  const [activeIndex, setActiveIndex] = useState(0);
  const nodeRef = useRef<HTMLDivElement>(null);
  const [isTouchedBottom, setIsTouchedBottom] = useState(false);
  const swiperRef = useRef<SwiperClass>();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

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
      fullname: 'Livielt',
      homeplanet: 'zenith',
      bg: gBG,
    },
    {
      name: 'mechanoid',
      fullname: 'Mechanical Technician',
      homeplanet: 'hyperborea',
      bg: mBG,
    },
    {
      name: 'spiritual',
      fullname: 'God Whisperer',
      homeplanet: 'aeon',
      bg: sBG,
    },
    {
      name: 'natural',
      fullname: 'Strangler',
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

      <SwitchTransition mode="out-in">
        <CSSTransition classNames="desc" nodeRef={nodeRef} key={activeIndex} timeout={800} unmountOnExit>
          {() => (
            <div
              ref={nodeRef}
              className="desc uppercase absolute w-[41.25rem] h-[21.875rem] left-[18.75%] top-[27.25%] border-[#F4C699] border-l-[3px] px-[2.625rem] pt-[2.625rem] pb-[3rem] box-border max-md:hidden z-20"
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

              <div className="normal-case line-clamp-3 mt-[1.875rem] max-w-[29rem]">
                {(intros as any)[swipers[activeIndex].name]}
              </div>

              <BasicButton className="mt-[1.875rem]" label="View More" onClick={onOpen} />
            </div>
          )}
        </CSSTransition>
      </SwitchTransition>

      <SchoolIcons
        className="absolute left-1/2 bottom-12 -translate-x-1/2 z-20"
        hoverActive
        cursorPointer
        activeIndex={activeIndex}
        onClick={onIconClick}
      />

      <Modal
        size="full"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        motionProps={{
          variants: {
            enter: {
              x: 0,
              opacity: 1,
              transition: {
                duration: 0.3,
                ease: 'easeOut',
              },
            },
            exit: {
              x: -100,
              opacity: 0,
              transition: {
                duration: 0.2,
                ease: 'easeIn',
              },
            },
          },
        }}
        classNames={{
          base: 'left-0 top-0 max-w-[50vw] bg-transparent h-screen pr-[1.875rem] shadow-none',
          wrapper: 'justify-start',
          body: 'bg-black pt-60 pl-[14.3%] pr-[12%] overflow-y-auto shadow-small',
          closeButton: 'right-0 top-1/2 -translate-y-1/2 w-[3.75rem] h-[3.75rem] z-10 hover:bg-transparent active:bg-transparent',
        }}
        closeButton={
          <div>
            <Image src={circelImg} alt="" fill />

            <Image
              className="w-3 h-4 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              src={arrowBackImg}
              alt=""
            />
          </div>
        }
      >
        <ModalContent>
          {(onClose) => (
            <ModalBody>
              <PageDesc
                hasBelt
                className="items-start max-w-[44.5rem] pl-3"
                title={
                  <div className="font-semakin">
                    <div className="text-5xl">{swipers[activeIndex].fullname}</div>
                    <div className="text-2xl text-basic-yellow mt-5">
                      Home Planet : {swipers[activeIndex].homeplanet}
                    </div>
                  </div>
                }
                subtitle={(intros as any)[swipers[activeIndex].name]}
              />
            </ModalBody>
          )}
        </ModalContent>
      </Modal>
    </section>
  );
}
