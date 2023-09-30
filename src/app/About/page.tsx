"use client"
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import './about.scss'

import MJ from "img/about/1@2x.png";
import JW from "img/about/2@2x.png";
import MasonZ from "img/about/3@2x.png";
import RobinZ from "img/about/4@2x.png";
import PuffZ from "img/about/5@2x.png";

const figureArray = [
  { img: MJ, name: "MJ", subTitle: "CEO" },
  { img: JW, name: "JW", subTitle: "COO" },
  { img: MasonZ, name: "MasonZ", subTitle: "Executive Producer" },
  { img: RobinZ, name: "RobinZ", subTitle: "Web 3 Producer" },
  { img: PuffZ, name: "PuffZ", subTitle: "Art Director" },
];

export default function About({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return (
    <div className="about relative w-full h-full">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-semakin text-8xl text-[#17100A]">
        OUR TEAM
      </div>
      <div className="swiper-screen w-full h-screen relative" >
        <Swiper
          className="w-full h-full"
          slidesPerView={3}
          centeredSlides={true}
          grabCursor={true}
          onSlideChange={() => console.log("slide change")}
          onSwiper={(swiper) => console.log(swiper)}
        >
          {figureArray.map((figureData, index) => {
            return (
              <SwiperSlide className="flex items-center justify-center w-[25rem]" key={figureData.name} >
                <Image loading='lazy' className="w-[20rem] h-[23rem]" src={figureData.img} alt={figureData.name} />
              </SwiperSlide>
            )
          })}
        </Swiper>
      </div>

    </div>
  );
}
