import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import IndexSlide from "../IndexSlide";
import RaceSlide from "../RaceSlide";
import EntertainmentSlide from "../EntertainmentSlide";
import ComingSoon from "../../common/ComingSoon";
import YellowCircle from "../../common/YellowCircle";
import './index.scss';
import { useState, useEffect } from 'react';
import { throttle } from 'lodash';

interface Props {
  onMaskAniEnd?: () => void;
}

export default function SwiperScreen(props: Props) {
  const [maskAni, setMaskAni] = useState(false);
  const [deltaY, setDeltaY] = useState(0);

  function onWheel(e: WheelEvent) {
    if (e.deltaY <= 0) return;
    if (e.deltaY > deltaY) setDeltaY(e.deltaY);
  }

  function reset() {
    setTimeout(() => {
      props.onMaskAniEnd?.();
      setDeltaY(0);
      setMaskAni(false);
    }, 200);
  }

  useEffect(throttle(() => {
    if (!deltaY) return;

    setMaskAni(true);
  }, 100), [deltaY])

  return (
    <div className="swiper-screen w-full h-screen relative overflow-hidden" onWheel={e => onWheel(e as unknown as WheelEvent)}>
      <Swiper
        className="w-full h-full"
        loop
        autoplay={{ delay: 5000 }}
        slidesPerView={1}
        onSlideChange={() => console.log("slide change")}
        onSwiper={(swiper) => console.log(swiper)}
      >
        <SwiperSlide>
          <IndexSlide />
        </SwiperSlide>

        <SwiperSlide>
          <RaceSlide />
        </SwiperSlide>

        <SwiperSlide>
          <EntertainmentSlide />
        </SwiperSlide>

        <SwiperSlide>
          <ComingSoon />
        </SwiperSlide>
      </Swiper>

      <YellowCircle className="absolute right-[4.375rem] bottom-20 z-10" />

      <div className={"swiper-mask absolute left-0 top-0 w-full h-[130vh] translate-y-full shadow-2xl z-20 " + (maskAni ? 'ani' : '')} onAnimationEnd={reset}></div>
    </div>
  );
}
