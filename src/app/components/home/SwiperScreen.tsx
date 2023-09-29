import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import IndexSlide from "./IndexSlide";
import RaceSlide from "./RaceSlide";
import EntertainmentSlide from "./EntertainmentSlide";
import ComingSoon from "../common/ComingSoon";

export default function SwiperScreen() {
  return (
    <Swiper
      className="w-full h-screen"
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
  );
}
