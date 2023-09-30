import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import IndexSlide from "./IndexSlide";
import RaceSlide from "./RaceSlide";
import EntertainmentSlide from "./EntertainmentSlide";
import ComingSoon from "../common/ComingSoon";
import YellowCircle from "../common/YellowCircle";

export default async function SwiperScreen() {
  // TODO 添加资源优先加载方法

  return (
    <div className="swiper-screen w-full h-screen relative">
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
    </div>
  );
}
