import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, Navigation } from 'swiper/modules';
import IndexSlide from '../IndexSlide';
import RaceSlide from '../RaceSlide';
import EntertainmentSlide from '../EntertainmentSlide';
import LimitedTestSlide from '../LimitedTestSlide';
import YellowCircle from '../../common/YellowCircle';
import { useEffect, useState, useRef, MutableRefObject } from 'react';
import arrowImg from 'img/astrark/arrow.png';
import Image from 'next/image';
import { createPortal } from 'react-dom';

interface Props {
  scrollY: number;
  isFixed: MutableRefObject<boolean>;
  parent: MutableRefObject<HTMLDivElement | null>;
  onMaskAniEnd?: () => void;
}

export default function SwiperScreen(props: Props) {
  const { scrollY, isFixed, parent, onMaskAniEnd } = props;
  const [maskAni, setMaskAni] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const navigationPrevRef = useRef(null);
  const navigationNextRef = useRef(null);
  const swiperRef = useRef<HTMLDivElement>(null);
  let rafId = 0;

  function reset() {
    setTimeout(() => {
      onMaskAniEnd?.();
      setMaskAni(false);
    }, 200);
  }

  useEffect(() => {
    setMaskAni(isFixed.current && scrollY < 0);
  }, [scrollY]);

  function setSwiperTY() {
    if (!swiperRef.current) return;

    if (!isFixed.current) {
      const y = window.luxy?.getWrapperTranslateY?.() || 0;
      swiperRef.current.style.transform = `translate3d(0, ${-y}px, 0)`;
    }
    rafId = requestAnimationFrame(setSwiperTY);
  }

  useEffect(() => {
    if (!window.luxy || !swiperRef.current) return;

    setSwiperTY();
    return () => {
      if (rafId > 0) cancelAnimationFrame(rafId);
    };
  }, []);

  const SwiperContent = (
    <div ref={swiperRef} className="swiper-screen w-full h-screen fixed left-0 top-0 overflow-hidden z-20 ">
      <Swiper
        modules={[Pagination, Autoplay, Navigation]}
        className="w-full h-full"
        loop
        // autoplay={{ delay: activeIndex === 0 ? 10000 : 5000, disableOnInteraction: false }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        speed={1500}
        slidesPerView={1}
        onSlideChange={(swiper) => {
          const pagi = document.querySelector('.home-swiper-pagination .pagi-active');
          const index = Array.prototype.indexOf.call(pagi?.parentNode?.childNodes, pagi);
          setActiveIndex(index);
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
        {/* <SwiperSlide>
          <IndexSlide needAni={activeIndex === 0} />
        </SwiperSlide> */}

        <SwiperSlide>
          <LimitedTestSlide needAni={activeIndex === 0} />
        </SwiperSlide>

        <SwiperSlide>
          <RaceSlide needAni={activeIndex === 1} />
        </SwiperSlide>

        <SwiperSlide>
          <EntertainmentSlide needAni={activeIndex === 2} />
        </SwiperSlide>

        <div className="home-swiper-pagination text-white z-10 font-decima flex"></div>
        <div ref={navigationPrevRef} className="home-swiper-navi home-swiper-navi-prev">
          <Image className="w-[3.125rem] h-7" src={arrowImg} alt="" />
        </div>
        <div ref={navigationNextRef} className="home-swiper-navi home-swiper-navi-next">
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

  return createPortal(SwiperContent, document.body);
}
