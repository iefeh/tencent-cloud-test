import { Swiper, SwiperSlide, SwiperClass } from 'swiper/react';
import { Pagination, Autoplay, Navigation } from 'swiper/modules';
import IndexSlide from '../slides/IndexSlide';
import RaceSlide from '../slides/RaceSlide';
import EntertainmentSlide from '../slides/EntertainmentSlide';
import LoyaltyProgramSlide from '../slides/LoyaltyProgramSlide';
import InviteNewSlide from '../slides/InviteNewSlide';
import LimitedTestSlide from '../slides/LimitedTestSlide';
import YellowCircle from '@/components/common/YellowCircle';
import { useEffect, useState, useRef } from 'react';
import arrowImg from 'img/astrark/arrow.png';
import Image from 'next/image';
import BadgeSlide from '../slides/BadgeSlide';
import NFT2Slide from '../slides/NFT2Slide';
import Game2048Slide from '../slides/Game2048Slide';
import { isMobile } from 'react-device-detect';

export default function SwiperScreen() {
  const slides = [
    LoyaltyProgramSlide,
    NFT2Slide,
    InviteNewSlide,
    BadgeSlide,
    RaceSlide,
    EntertainmentSlide,
    // IndexSlide,
    // LimitedTestSlide,
  ];
  // slides.splice(isMobile ? 0 : 1, 0, Game2048Slide);
  const [needAnis, setNeedAnis] = useState([true, ...Array(slides.length - 1).fill(false)]);
  const navigationPrevRef = useRef(null);
  const navigationNextRef = useRef(null);

  return (
    <div className="swiper-screen w-full h-screen overflow-hidden z-20 relative ">
      <Swiper
        modules={[Pagination, Autoplay, Navigation]}
        className="w-full h-full"
        loop
        // 视频10s自动切换，图片5s自动切换
        // autoplay={{ delay: activeIndex === 0 ? 10000 : 5000, disableOnInteraction: false }}
        autoplay={{ delay: 15000, disableOnInteraction: false }}
        speed={2000}
        slidesPerView={1}
        onSlideChangeTransitionStart={(swiper) => {
          const list = [...needAnis];
          list[swiper.realIndex] = true;
          setNeedAnis(list);
        }}
        onSlideChangeTransitionEnd={(swiper) => {
          const list = needAnis.map((_, i) => i === swiper.realIndex);
          setNeedAnis(list);
        }}
        navigation={{
          prevEl: navigationPrevRef.current,
          nextEl: navigationNextRef.current,
        }}
        pagination={{
          el: '.home-swiper-pagination',
          bulletClass: 'pagi',
          bulletActiveClass: 'pagi-active',
          type: 'bullets',
          clickable: true,
          renderBullet(index, className) {
            return `<span class="${className}">${(index + 1 + '').padStart(2, '0')}</span>`;
          },
        }}
      >
        {/* 此处每个SwiperSlide中，组件的needAni属性判定的下标需要根据实际生效的顺序写 */}

        {slides.map((Slide, index) => (
          <SwiperSlide key={index}>
            <Slide needAni={needAnis[index]} />
          </SwiperSlide>
        ))}

        <div className="home-swiper-pagination text-white z-10 font-decima flex"></div>
        <div ref={navigationPrevRef} className="home-swiper-navi home-swiper-navi-prev">
          <Image className="w-[3.125rem] h-7" src={arrowImg} alt="" />
        </div>
        <div ref={navigationNextRef} className="home-swiper-navi home-swiper-navi-next">
          <Image className="w-[3.125rem] h-7" src={arrowImg} alt="" />
        </div>
      </Swiper>

      <YellowCircle className="absolute right-[4.375rem] bottom-20 z-10" />
    </div>
  );
}
