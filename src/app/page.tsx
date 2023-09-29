"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import IndexSlide from "./components/home/IndexSlide";
import RaceSlide from "./components/home/RaceSlide";
import EntertainmentSlide from "./components/home/EntertainmentSlide";
import ComingSoon from "./components/common/ComingSoon";

export default function Home() {
  return (
    <section className="overflow-hidden flex flex-col items-center justify-between">
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
    </section>
  );
}
