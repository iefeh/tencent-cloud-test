import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, Navigation } from 'swiper/modules';
import RaceSlide from '../slides/RaceSlide';
import EntertainmentSlide from '../slides/EntertainmentSlide';
import LoyaltyProgramSlide from '../slides/LoyaltyProgramSlide';
import InviteNewSlide from '../slides/InviteNewSlide';
import YellowCircle from '@/components/common/YellowCircle';
import { useState, useRef, memo } from 'react';
import arrowImg from 'img/astrark/arrow.png';
import Image from 'next/image';
import BadgeSlide from '../slides/BadgeSlide';
import NFT2Slide from '../slides/NFT2Slide';
import LotterySlide from '../slides/LotterySlide';
import MinigamesSlide from '../slides/MinigamesSlide';
import Game2048Slide from '../slides/Game2048Slide';

const slides = [
  LoyaltyProgramSlide,
  // Game2048Slide,
  MinigamesSlide,
  // LotterySlide,
  // NFT2Slide,
  InviteNewSlide,
  RaceSlide,
];

const SildeItem = memo(function SlideCom({ idx, needAni }: { idx: number; needAni: boolean }) {
  const Comp = slides[idx];
  return <Comp needAni={needAni}></Comp>;
});

export default function SwiperScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [needAnis, setNeedAnis] = useState([true, ...Array(slides.length).fill(false)]);

  const navigationPrevRef = useRef(null);
  const navigationNextRef = useRef(null);

  return (
    <div className="swiper-screen w-full h-screen overflow-hidden z-20 relative ">
      <Swiper
        modules={[Pagination, Autoplay, Navigation]}
        className="w-full h-full"
        loop
        // 视频10s自动切换，图片5s自动切换
        autoplay={{ delay: [1, 3].includes(activeIndex) ? 10000 : 5000, disableOnInteraction: false }}
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
          setActiveIndex(swiper.realIndex);
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

        {slides.map((_, index) => (
          <SwiperSlide key={index}>
            <SildeItem idx={index} needAni={needAnis[index]}></SildeItem>
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
