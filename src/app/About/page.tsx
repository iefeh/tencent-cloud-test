"use client"
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";

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
    <div className="About relative w-full h-full scroll-wrapper">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-semakin text-9xl text-[#17100A]">
        OUR TEAM
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64" >
        <Swiper
          onSlideChange={() => console.log("slide change")}
          onSwiper={(swiper) => console.log(swiper)}
        >
          {figureArray.map((figureData, index) => {
            return (
              <SwiperSlide key={figureData.name} >
                <Image className="w-64 h-64" src={figureData.img} alt={figureData.name} />
              </SwiperSlide>
            )
          })}
        </Swiper>
      </div>
    </div>
  );
}
