import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Mousewheel } from 'swiper/modules';
import useSketch from '@/hooks/useSketch';
import leftArrows from 'img/about/arrow_1.png';
import rightArrows from 'img/about/arrow_2.png';

export default function FeatureScreen() {
  const features = [
    '/img/astrark/pre-register/ft_ANGEL.jpg',
    '/img/astrark/pre-register/ft_FLAME_APE.jpg',
    '/img/astrark/pre-register/ft_MECHANICAL_TECHNICIAN .jpg',
    '/img/astrark/pre-register/ft_SHADOW_DANCER.jpg',
    '/img/astrark/pre-register/ft_SLIENT_NINJA.jpg',
    '/img/astrark/pre-register/ft_SPHERIC_ELECTRICITY.jpg',
    '/img/astrark/pre-register/ft_STRANGLER.jpg',
  ];
  const { nodeRef, sketch, onSwiperInit, onSlideChange } = useSketch<HTMLDivElement>(features);

  return (
    <div className="w-screen h-screen relative page-astrark-pre-register-feature-screen">
      <div ref={nodeRef} className="blurBg absolute right-0 top-0 z-0 w-full h-full bg-black blur"></div>

      <div className="relative w-full h-full z-10 flex flex-col justify-center items-center text-center">
        <div className="p-2 bg-clip-text bg-[linear-gradient(-50deg,_#DBAC73_0%,_#F1EEC9_33.203125%,_#F1EEC9_82.5927734375%,_#CFA36F_100%)] mb-[3.25rem]">
          <div className="font-semakin text-transparent text-6xl">Game Features</div>
        </div>

        <Swiper
          className="w-full mb-[5.25rem]"
          modules={[EffectCoverflow]}
          effect={'coverflow'}
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={'auto'}
          speed={0}
          direction="horizontal"
          coverflowEffect={{
            rotate: 50,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: true,
          }}
          onInit={onSwiperInit}
          onActiveIndexChange={onSlideChange}
        >
          {features.map((item, index) => (
            <SwiperSlide key={index} className="relative max-w-[80%] !w-[50rem] !h-[28.125rem] bg-center bg-cover">
              <Image className="w-full h-full object-contain" src={item} alt="" width={800} height={450} />
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="scroll_btn w-24 h-24 rounded-full uppercase flex justify-center items-center border border-[#F6C799] text-base text-[#F6C799]">
          <div className="relative w-full h-full flex justify-center items-center">
            scroll
            <Image className="absolute -left-[0.875rem] w-[0.4375rem] h-3" src={rightArrows} alt="left" unoptimized />
            <Image className="absolute -right-[0.875rem] w-[0.4375rem] h-3" src={leftArrows} alt="right" unoptimized />
          </div>
        </div>
      </div>
    </div>
  );
}
