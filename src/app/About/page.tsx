"use client"
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import './about.scss'
import MJ from "img/about/1@2x.png";
import JW from "img/about/2@2x.png";
import MasonZ from "img/about/3@2x.png";
import RobinZ from "img/about/4@2x.png";
import PuffZ from "img/about/5@2x.png";
import BScroll from "@better-scroll/core";
import { createRef, useEffect } from "react";
import ScrollBar from "@better-scroll/scroll-bar";
import MouseWheel from "@better-scroll/mouse-wheel";
import { Mousewheel } from "swiper/modules";

BScroll.use(MouseWheel);
BScroll.use(ScrollBar);

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
  const scrollWrapper = createRef<HTMLDivElement>();

  useEffect(() => {
    const bs = new BScroll(scrollWrapper.current!, {
      scrollY: true,
      bounce: false,
      mouseWheel: true,
    });
  }, [scrollWrapper]);

  return (
    <div id="about" ref={scrollWrapper} className="about relative scroll-wrapper w-full h-screen flex flex-col items-center justify-between overflow-hidden">
      <div className="scroll-container w-full relative" >   
        <div className="swiper-screen w-full h-screen relative" >
          <div className="absolute w-full h-full flex items-center justify-center font-semakin text-9xl text-[#17100A]">
            OUR TEAM
          </div>
          <Swiper
            className="w-full h-full"
            modules={[Mousewheel]}
            slidesPerView={3}
            mousewheel={{
              releaseOnEdges: true
            }}
            centeredSlides={true}
            onSlideChange={() => console.log("slide change")}
            onSwiper={(swiper) => console.log(swiper)}
          >
            {figureArray.map((figureData, index) => {
              return (
                <SwiperSlide className="flex items-center justify-start w-[24rem]" key={figureData.name} >
                  <Image loading='lazy' className="w-[20rem] h-[23rem]" src={figureData.img} alt={figureData.name} />
                </SwiperSlide>
              )
            })}
          </Swiper>
        </div>
        <div className="h-screen w-full" >123</div>
      </div>
    </div>
  );
}
