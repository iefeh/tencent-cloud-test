import Image from 'next/image';
import { Swiper, SwiperClass, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Mousewheel } from 'swiper/modules';
import useSketch from '@/hooks/useSketch';
import { PreRegisterInfoDTO } from '@/http/services/astrark';
import PreRegisterButton from '../components/PreRegisterButton';

export default function FeatureScreen({
  preInfo,
  onPreRegistered,
}: {
  preInfo: PreRegisterInfoDTO | null;
  onPreRegistered?: () => void;
}) {
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
          modules={[EffectCoverflow, Mousewheel]}
          mousewheel={!sketch.current?.isRunning && { releaseOnEdges: true, thresholdTime: 1200 }}
          effect={'coverflow'}
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={'auto'}
          speed={0}
          direction="horizontal"
          loop
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
            <SwiperSlide key={index} className="relative !w-[50rem] !h-[28.125rem] bg-center bg-cover">
              <Image className="w-full h-full object-cover" src={item} alt="" width={800} height={450} />
            </SwiperSlide>
          ))}
        </Swiper>

        {preInfo?.preregistered || <PreRegisterButton onPreRegistered={onPreRegistered} />}
      </div>
    </div>
  );
}
