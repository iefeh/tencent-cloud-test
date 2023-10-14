import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, Navigation } from 'swiper/modules';
import IndexSlide from '../IndexSlide';
import RaceSlide from '../RaceSlide';
import EntertainmentSlide from '../EntertainmentSlide';
import LimitedTestSlide from '../LimitedTestSlide';
import YellowCircle from '../../common/YellowCircle';
import { useState, useEffect } from 'react';
import { throttle } from 'lodash';
import arrowImg from 'img/astrark/arrow.png';
import Image from 'next/image';

interface Props {
  onMaskAniEnd?: () => void;
}

export default function SwiperScreen(props: Props) {
  const [maskAni, setMaskAni] = useState(false);
  const [deltaY, setDeltaY] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  function onWheel(e: WheelEvent) {
    if (e.deltaY <= 0) return;
    if (e.deltaY > deltaY) setDeltaY(e.deltaY);
  }

  function onTouchStart(e: TouchEvent) {
    if (!e.target) return;
    (e.target as HTMLElement).dataset.y = e.touches[0].pageY + '';
  }

  function onTouchMove(e: TouchEvent) {
    if (!e.target) return;

    const y0 = (e.target as HTMLElement).dataset.y;
    if (y0 === undefined || Number.isNaN(y0)) return;

    if (+y0 > e.touches[0].pageY) setMaskAni(true);
  }

  function reset() {
    setTimeout(() => {
      props.onMaskAniEnd?.();
      setDeltaY(0);
      setMaskAni(false);
    }, 200);
  }

  useEffect(
    throttle(() => {
      if (!deltaY) return;

      setMaskAni(true);
    }, 100),
    [deltaY],
  );

  return (
    <div
      className="swiper-screen w-full h-screen relative overflow-hidden"
      onWheel={(e) => onWheel(e as unknown as WheelEvent)}
      onTouchStart={(e) => onTouchStart(e as any)}
      onTouchMove={(e) => onTouchMove(e as any)}
    >
      <Swiper
        modules={[Pagination, Autoplay, Navigation]}
        className="w-full h-full"
        loop
        autoplay={{ delay: activeIndex === 0 ? 10000 : 5000 }}
        speed={1500}
        slidesPerView={1}
        onSlideChange={(swiper) => {
          const pagi = document.querySelector('.home-swiper-pagination .pagi-active');
          const index = Array.prototype.indexOf.call(pagi?.parentNode?.childNodes, pagi);
          setActiveIndex(index);
        }}
        navigation={{
          prevEl: '.home-swiper-navi .home-swiper-navi-prev',
          nextEl: '.home-swiper-navi .home-swiper-navi-next',
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
        <SwiperSlide>
          <IndexSlide needAni={activeIndex === 0} />
        </SwiperSlide>

        <SwiperSlide>
          <RaceSlide needAni={activeIndex === 1} />
        </SwiperSlide>

        <SwiperSlide>
          <EntertainmentSlide needAni={activeIndex === 2} />
        </SwiperSlide>

        <SwiperSlide>
          <LimitedTestSlide needAni={activeIndex === 3} />
        </SwiperSlide>

        <div className="home-swiper-pagination text-white z-10 font-decima flex"></div>
        <div className="home-swiper-navi home-swiper-navi-prev">
          <Image className="w-[3.125rem] h-7" src={arrowImg} alt="" />
        </div>
        <div className="home-swiper-navi home-swiper-navi-next">
          <Image className="w-[3.125rem] h-7" src={arrowImg} alt="" />
        </div>
      </Swiper>

      <YellowCircle className="absolute right-[4.375rem] bottom-20 z-10" />

      <div
        className={
          'swiper-mask absolute left-0 top-0 w-full h-[130vh] translate-y-full shadow-2xl z-20 ' +
          (maskAni ? 'ani' : '')
        }
        onAnimationEnd={reset}
      ></div>
    </div>
  );
}
