"use client";
import Image, { StaticImageData } from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import "./about.scss";
import MJ from "img/about/1@2x.png";
import JW from "img/about/2@2x.png";
import MasonZ from "img/about/3@2x.png";
import RobinZ from "img/about/4@2x.png";
import PuffZ from "img/about/5@2x.png";
import leftArrows from "img/about/arrow_1.png";
import rightArrows from "img/about/arrow_2.png";
import BScroll from "@better-scroll/core";
import { useEffect, useRef, useState } from "react";
import ScrollBar from "@better-scroll/scroll-bar";
import MouseWheel from "@better-scroll/mouse-wheel";
import { Mousewheel } from "swiper/modules";
import { IntersectionObserverHook } from "@/app/hooks/intersectionObserverHook";

BScroll.use(MouseWheel);
BScroll.use(ScrollBar);

interface Figure {
  img: StaticImageData;
  name: string;
  subTitle: string
}

const figureArray: Figure[] = [
  { img: MJ, name: "M.J", subTitle: "CEO" },
  { img: JW, name: "J.W", subTitle: "COO" },
  { img: MasonZ, name: "Mason Z", subTitle: "Executive Producer" },
  { img: RobinZ, name: "Robin Z", subTitle: "Web 3 Producer" },
  { img: PuffZ, name: "Puff Z", subTitle: "Art Director" },
];
const sponsorArray = new Array(20).fill(1);

export default function About({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const containerRef = useRef(null);
  const isVisiable = IntersectionObserverHook({ currentRef: containerRef});
  const [curFigure, setCurFigure] = useState<Figure>()
  const [open, setOpen] = useState(false);
  // const scrollWrapper = createRef<HTMLDivElement>();

  // useEffect(() => {
  //   const bs = new BScroll(scrollWrapper.current!, {
  //     scrollY: true,
  //     bounce: false,
  //     mouseWheel: true,
  //   });
  // }, [scrollWrapper]);

  return (
    <div className="about relative scroll-wrapper w-full h-screen flex flex-col items-center justify-between overflow-y-auto">
      <div className="absolute w-full h-screen z-10" hidden={!open} >
        1234
        <div className="absolute bottom-40 top-1/2 -translate-x-1/2" >
          <Image className="object-cover" src="/img/about/button@2x.png" alt="close" fill sizes="100%" />
        </div>
      </div>
      <div className="scroll-container w-full relative">
        <div className="swiper-screen w-full h-screen relative">
          <div className="absolute font-semakin w-full h-full flex items-center justify-center text-9xl text-[#17100A]">
            OUR TEAM
          </div>
          <Swiper
            className="w-full h-full"
            modules={[Mousewheel]}
            slidesPerView={3}
            mousewheel={{
              releaseOnEdges: true,
            }}
            centeredSlides={true}
            onSlideChange={() =>
              console.log("slide change")
            }
            onSwiper={(swiper) => console.log(swiper)}
          >
            {figureArray.map((figureData, index) => {
              return (
                <SwiperSlide
                  className="flex items-center justify-start w-[24rem]"
                  key={figureData.name}
                >
                  <div onClick={() => {setCurFigure(figureData); setOpen(true); }} className="transition-transform transform group" >
                    <Image
                      loading="lazy"
                      className="w-[20rem] h-[23rem] cursor-pointer group-hover:hover:scale-[1.1] duration-300"
                      src={figureData.img}
                      alt={figureData.name}
                    />
                    <div className="flex flex-col items-center text-[2rem] -translate-y-[2.1rem] font-semakin" >
                      <span className="text-white mb-1 leading-none" >{figureData.name}</span>
                      <span className="text-[#666] leading-none whitespace-nowrap" >{figureData.subTitle}</span>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
          <div className="scroll_btn w-[5vw] h-[5vw] rounded-full uppercase flex justify-center items-center border border-[#F6C799] text-[.8vw] text-[#F6C799] absolute top-1/2 -translate-y-1/2 right-[35vw] z-0">
            <div className="relative w-full h-full flex justify-center items-center" >
              scroll
              <Image className="absolute -left-[.8vw] w-[.4vw] h-[.6vw]" src={rightArrows} alt="left" />
              <Image className="absolute -right-[.8vw] w-[.4vw] h-[.6vw]" src={leftArrows} alt="right" />
            </div>
          </div>
        </div>
        <div ref={containerRef} className="h-screen w-full friendLink_wrap min-h-screen bg-black flex flex-col justify-center items-center bg-aboutBg bg-center">
          <div className={`friendLink_title uppercase text-[3vw] font-semakin leading-none mb-[7vw] translate-y-[5vw] fill-mode-[both] ${isVisiable && 'slideInAnim'}`} >
            Our Partners
          </div>
          <div className={`friends translate-y-[5vw] fill-mode-[both] ${isVisiable && 'slideInAnim'}`} >
            <ul className="gap-[2vw] grid grid-cols-5" >
              {
                sponsorArray.map((value, index) => {
                  return (
                    <li key={index} className="w-[9.4vw] h-[4.7vw] relative" >
                      <Image className="object-cover" src={`/img/about/${index + 1}.png`} alt="" fill sizes="100%" />
                    </li>
                  )
                })
              }

            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
