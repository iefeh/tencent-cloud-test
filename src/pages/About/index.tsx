"use client";
import Image, { StaticImageData } from "next/image";
import { Swiper, SwiperClass, SwiperSlide } from "swiper/react";
import MJ from "img/about/1@2x.png";
import JW from "img/about/2@2x.png";
import MasonZ from "img/about/3@2x.png";
import RobinZ from "img/about/4@2x.png";
import PuffZ from "img/about/5@2x.png";
import leftArrows from "img/about/arrow_1.png";
import rightArrows from "img/about/arrow_2.png";
import { useRef, useState } from "react";
import { FreeMode, Mousewheel } from "swiper/modules";
import { IntersectionObserverHook } from "@/hooks/intersectionObserverHook";
import PageDesc from "../components/common/PageDesc";
import Head from "next/head";

interface Figure {
  img: StaticImageData;
  name: string;
  subTitle: string;
  introduce: string;
}

const figureArray: Figure[] = [
  {
    img: MJ,
    name: "M.J",
    subTitle: "CEO",
    introduce: `<div class="text-left whitespace-nowrap" >
  <p>- Ex-Riot senior leadership</p>
  <p>- 10-year game dev & publishing experience</p>
  <p>- Lifetime hardcore gamer, Starcraft pro</p>
  <p>- Investment banking "runaway"</p>
  <p>- Terrible singer</p>
  <p>- Daydreams constantly</p>
  <p>- Taking coffee too much</p>
  <p>- Amature Coser</p>
</div>`,
  },
  {
    img: JW,
    name: "J.W",
    subTitle: "COO",
    introduce: `<div class="text-left whitespace-nowrap" >
  <p>- Ex-Riot senior leadership</p>
  <p>- Ex-pro player，lifetime hardcore gamer</p>
  <p>- Traveller on earth, also from Azeroth to Dragon isles</p>
  <p>- Coke lover</p>
  <p>- Having social phobia (randomly)</p>
</div>`,
  },
  {
    img: MasonZ,
    name: "Mason Z",
    subTitle: "Executive Producer",
    introduce: `<div class="text-left whitespace-nowrap" >
  <p>- 14 years game production experience</p>
  <p>- Formerly Head of two game studios of Tencent family</p>
  <p>- Bacon evangelist</p>
  <p>- Sarcastic Master</p>
  <p>- Foe of Fats for Life</p>
</div>`,
  },
  {
    img: RobinZ,
    name: "Robin Z",
    subTitle: "Web 3 Producer",
    introduce: `<div class="text-left whitespace-nowrap" >
  <p>- Defi project builder</p>
  <p>- Crypto native since 2014</p>
  <p>- 7 years full-stack mobile-game dev & production experience</p>
  <p>- Game collector</p>
  <p>- Vim lover</p>
  <p>- Servant of the Art Director</p>
</div>`,
  },
  {
    img: PuffZ,
    name: "Puff Z",
    subTitle: "Art Director",
    introduce: `<div class="text-left whitespace-nowrap" >
  <p>- 8 years Chief Gaming Companion experience</p>
  <p>- Discerning taste, unique aesthetics, and keen insight into players' psychology</p>
  <p>- Tree-climbing Pro</p>
  <p>- Ball Games Enthusiast</p>
  <p>- Fish Lover</p>
  <p>- Watermark maker</p>
</div>`,
  },
];
const sponsorArray = new Array(22).fill(1);

export default function About({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const containerRef = useRef(null);
  const isVisiable = IntersectionObserverHook({ currentRef: containerRef });
  const [curFigure, setCurFigure] = useState<Figure>(figureArray[0]);
  const [open, setOpen] = useState<boolean | null>(null);
  const [swiperWrapper, setSwiperWrapper] = useState<SwiperClass>();
  const [swiperFigure, setSwiperFigure] = useState<SwiperClass>();

  function onSlideScrollWrapper(swiper: SwiperClass, event: WheelEvent) {
    // console.log("%c Line:108 🥤 event", "color:#6ec1c2", event, swiper);
    if (swiper.isEnd) {
      swiperFigure?.mousewheel.disable()
    } else {
      swiperFigure?.mousewheel.enable()
    }
  }

  function onSlideScroll(swiper: SwiperClass, event: WheelEvent) {
    // console.log("%c Line:108 🥤 event", "color:#6ec1c2", event, swiper);
    if (swiper.isEnd) {
      swiperWrapper?.mousewheel.enable();
    } else {
      swiperWrapper?.mousewheel.disable();
    }
  }

  return (
    <div className="about w-full h-screen flex flex-col items-center justify-between">
      <Head>
        <title>About | Moonveil</title>
      </Head>

      <Swiper
        className="relative scroll-wrapper w-full h-screen"
        direction="vertical"
        modules={[Mousewheel]}
        // freeMode={true}
        onScroll={onSlideScrollWrapper}
        // mousewheel={true}
        slidesPerView={1}
        onSwiper={setSwiperWrapper}
      >
        <SwiperSlide>
          <div className="swiper-screen w-full h-screen relative">
            <div
              className={`absolute w-full h-screen z-[2] max-sm:hidden bg-black ${open ? 'referralInAnim' : 'referralOutAnim'}`}
              hidden={open === null}
            >
              <div className="flex h-[90vh] shadow-[0px_0px_30px_10px_#514032]">
                <div className="w-1/2 flex items-center justify-start p-56">
                  <PageDesc
                    hasBelt
                    className="character-desc text-left whitespace-nowrap"
                    title={`<span>${curFigure?.name}</span><br><span class="text-[#666]" >${curFigure?.subTitle}</span>`}
                    subtitle={curFigure?.introduce}
                  />
                </div>
                <div className="w-1/2 flex items-center justify-center">
                  <Image
                    className="object-cover w-[40rem] h-[40.75rem]"
                    src={curFigure?.img!}
                    alt={curFigure?.name!}
                  ></Image>
                </div>
              </div>
              <div
                onClick={() => setOpen(!open)}
                className="absolute bottom-[10vh] left-1/2 z-[3] -translate-x-1/2 translate-y-1/2 w-10 h-10 cursor-pointer"
              >
                <span className={`absolute text-xs top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-black z-10`}>
                  <span>&#x2715;</span>
                </span>
                <span className="absolute font-semakin -bottom-[80%] -translate-x-1/2 left-1/2 text-[#F6C799]" >Close</span>
                <Image
                  className="object-cover"
                  src="/img/about/button@2x.png"
                  alt="close"
                  fill
                  sizes="100%"
                />
              </div>
              {/* <div className="absolute bottom-[11.2rem] h-[1px] w-full lineYellow" ></div> */}
            </div>
            <div className="absolute font-semakin w-full h-full flex items-center justify-center text-9xl text-[#17100A]">
              OUR TEAM
            </div>
            <Swiper
              className="w-full h-full"
              modules={[Mousewheel, FreeMode]}
              freeMode={true}
              slidesPerView={3}
              mousewheel={true}
              breakpoints={{
                320: {
                  slidesPerView: 1,
                },
                640: {
                  slidesPerView: 3
                }
              }}
              centeredSlides={true}
              onScroll={onSlideScroll}
              onSwiper={setSwiperFigure}
            >
              {figureArray.map((figureData, index) => {
                return (
                  <SwiperSlide
                    className="flex items-center justify-start w-[24rem]"
                    key={figureData.name}
                  >
                    <div
                      onClick={() => {
                        setCurFigure(figureData);
                        setOpen(true);
                      }}
                      className="transition-transform transform group"
                    >
                      <Image
                        className="w-[30.75rem] h-[31.56rem] cursor-pointer group-hover:hover:scale-[1.1] duration-300"
                        src={figureData.img}
                        alt={figureData.name}
                      />
                      <div className="flex flex-col items-center text-[2rem] -translate-y-[2.1rem] font-semakin">
                        <span className="text-white mb-1 leading-none">
                          {figureData.name}
                        </span>
                        <span className="text-[#666] leading-none whitespace-nowrap">
                          {figureData.subTitle}
                        </span>
                      </div>
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
            <div className="scroll_btn max-sm:hidden w-[5vw] h-[5vw] rounded-full uppercase flex justify-center items-center border border-[#F6C799] text-[.8vw] text-[#F6C799] absolute top-1/2 -translate-y-1/2 right-[35vw] z-0">
              <div className="relative w-full h-full flex justify-center items-center">
                scroll
                <Image
                  className="absolute -left-[.8vw] w-[.4vw] h-[.6vw]"
                  src={rightArrows}
                  alt="left"
                />
                <Image
                  className="absolute -right-[.8vw] w-[.4vw] h-[.6vw]"
                  src={leftArrows}
                  alt="right"
                />
              </div>
            </div>
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div
            ref={containerRef}
            className="h-screen w-full friendLink_wrap min-h-screen bg-black flex flex-col justify-center items-center bg-aboutBg bg-center"
          >
            <div
              className={`friendLink_title uppercase text-[3.75rem] font-semakin leading-none mb-[4rem] translate-y-[16px] fill-mode-[both] ${isVisiable && "slideInAnim"
                }`}
            >
              Investors & Partners
            </div>
            <div
              className={`friends translate-y-[16px] fill-mode-[both] ${isVisiable && "slideInAnim"}`}
            >
              <ul className="gap-[2.38rem] grid grid-cols-5">
                {sponsorArray.map((value, index) => {
                  if (index === 20) return null;

                  return (
                    <li
                      key={index}
                      className="w-[11.25rem] h-[5.53rem] relative"
                    >
                      <Image
                        className="object-cover"
                        src={`/img/about/${index + 1}.png`}
                        alt=""
                        fill
                        sizes="100%"
                      />
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  );
}
