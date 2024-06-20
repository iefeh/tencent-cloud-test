import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, Navigation } from 'swiper/modules';
import RaceSlide from '../slides/RaceSlide';
import EntertainmentSlide from '../slides/EntertainmentSlide';
import LoyaltyProgramSlide from '../slides/LoyaltyProgramSlide';
import InviteNewSlide from '../slides/InviteNewSlide';
import YellowCircle from '@/components/common/YellowCircle';
import { useState, useRef, useMemo } from 'react';
import arrowImg from 'img/astrark/arrow.png';
import Image from 'next/image';
import BadgeSlide from '../slides/BadgeSlide';
import NFT2Slide from '../slides/NFT2Slide';
import Game2048Slide from '../slides/Game2048Slide';
import LotterySlide from '../slides/LotterySlide';
import { isMobile } from 'react-device-detect';

export default function SwiperScreen() {
  const [needAnis, setNeedAnis] = useState([true, ...Array(7).fill(false)]);

  const LoyaltyProgramSlideMemo = useMemo(() => <LoyaltyProgramSlide needAni={needAnis[0]} />, [needAnis[0]]);
  const LotterySlideMemo = useMemo(() => <LotterySlide needAni={needAnis[1]} />, [needAnis[1]]);
  const NFT2SlideMemo = useMemo(() => <NFT2Slide needAni={needAnis[2]} />, [needAnis[2]]);
  const InviteNewSlideMemo = useMemo(() => <InviteNewSlide needAni={needAnis[3]} />, [needAnis[3]]);
  const BadgeSlideMemo = useMemo(() => <BadgeSlide needAni={needAnis[4]} />, [needAnis[4]]);
  const RaceSlideMemo = useMemo(() => <RaceSlide needAni={needAnis[5]} />, [needAnis[5]]);
  const EntertainmentSlideMemo = useMemo(() => <EntertainmentSlide needAni={needAnis[6]} />, [needAnis[6]]);
  // const Game2048SlideMemo = useMemo(() => <Game2048Slide needAni={needAnis[7]} />, [needAnis[7]]);

  const slides = [
    LoyaltyProgramSlideMemo,
    LotterySlideMemo,
    NFT2SlideMemo,
    InviteNewSlideMemo,
    BadgeSlideMemo,
    RaceSlideMemo,
    EntertainmentSlideMemo,
  ];
  // slides.splice(isMobile ? 0 : 1, 0, Game2048SlideMemo);
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

        {slides.map((slide, index) => (
          <SwiperSlide key={index}>{slide}</SwiperSlide>
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
