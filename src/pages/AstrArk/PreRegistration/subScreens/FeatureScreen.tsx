import Image from 'next/image';
import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Mousewheel } from 'swiper/modules';
import useSketch from '@/hooks/useSketch';
import { throttle } from 'lodash';

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
  const [activeIndex, setActiveIndex] = useState(0);
  const { nodeRef, sketch } = useSketch<HTMLDivElement>(features);

  const changeBySwiper = throttle((index: number) => {
    const nextIndex = (activeIndex + (index > activeIndex ? 1 : -1) + features.length) % features.length;
    console.log(1111111, nextIndex);
    sketch.current?.jumpTo(nextIndex);
    setActiveIndex(nextIndex);
  }, 500);

  function onIndexChange(index: number) {
    if (index === activeIndex || sketch.current?.isRunning) return;
    changeBySwiper(index);
  }

  return (
    <div className="w-screen h-screen relative page-astrark-pre-register-feature-screen">
      <div ref={nodeRef} className="blurBg absolute right-0 top-0 z-0 w-full h-full bg-black blur"></div>

      <div className="relative w-full h-full z-10 flex flex-col justify-center items-center text-center">
        <Swiper
          className="w-full"
          modules={[EffectCoverflow, Mousewheel]}
          mousewheel={true}
          effect={'coverflow'}
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={'auto'}
          loop
          coverflowEffect={{
            rotate: 50,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: true,
          }}
          onActiveIndexChange={(swiper) => onIndexChange(swiper.realIndex)}
        >
          {features.map((item, index) => (
            <SwiperSlide key={index} className="relative !w-[50rem] !h-[28.125rem] bg-center bg-cover">
              <Image className="w-full h-full object-cover" src={item} alt="" width={800} height={450} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
