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
import { useEffect, useRef, useState } from "react";
import { FreeMode, Mousewheel } from "swiper/modules";
import { IntersectionObserverHook } from "@/hooks/intersectionObserverHook";
import PageDesc from "../components/common/PageDesc";
import Head from "next/head";
import EntertainmentSlide from "../components/home/EntertainmentSlide";

interface Figure {
  img: StaticImageData;
  name: string;
  subTitle: string;
  introduce: string;
}

const figureArray: Figure[] = [
  {
    img: MJ,
    name: 'M.J',
    subTitle: 'CEO',
    introduce: `<div class="subtitle text-left whitespace-nowrap" >
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
    name: 'Jason',
    subTitle: 'COO',
    introduce: `<div class="subtitle text-left whitespace-nowrap" >
  <p>- Ex-Riot senior leadership</p>
  <p>- Ex-pro player，lifetime hardcore gamer</p>
  <p>- Traveller on earth, also from Azeroth to Dragon isles</p>
  <p>- Coke lover</p>
  <p>- Having social phobia (randomly)</p>
</div>`,
  },
  {
    img: MasonZ,
    name: 'Mason Z',
    subTitle: 'Executive Producer',
    introduce: `<div class="subtitle text-left whitespace-nowrap" >
  <p>- 14 years game production experience</p>
  <p>- Formerly Head of a game studio of the Tencent family</p>
  <p>- Bacon evangelist</p>
  <p>- Sarcastic Master</p>
  <p>- Foe of Fats for Life</p>
</div>`,
  },
  {
    img: RobinZ,
    name: 'Robin Z',
    subTitle: 'Web 3 Producer',
    introduce: `<div class="subtitle text-left whitespace-nowrap" >
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
    name: 'Puff Z',
    subTitle: 'Art Director',
    introduce: `<div class="subtitle text-left whitespace-nowrap" >
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
  const wheelRef = useRef({ scrollSpeed: 0, lastTime: 0, lastScrollTop: 0 });
  const isVisiable = IntersectionObserverHook({ currentRef: containerRef });
  const [curFigure, setCurFigure] = useState<Figure>(figureArray[0]);
  const [open, setOpen] = useState<boolean | null>(null);
  const [swiperWrapper, setSwiperWrapper] = useState<SwiperClass>();
  const [swiperFigure, setSwiperFigure] = useState<SwiperClass>();

  function onSlideScrollWrapper(swiper: SwiperClass, event: WheelEvent) {
    const { lastTime, scrollSpeed } = wheelRef.current
    // 获取当前时间
    const currentTime = new Date().getTime();

    // 计算时间差
    const timeDiff = currentTime - lastTime;

    // 计算滚动速度
    if (timeDiff < 200) {
      wheelRef.current.scrollSpeed += event.deltaY * 0.01;
    } else {
      wheelRef.current.scrollSpeed = event.deltaY * 0.01;
    }

    // 更新最后滚动时间
    wheelRef.current.lastTime = currentTime;

    // 开始滚动动画
    requestAnimationFrame(scroll);
    if (swiper.translate === 0) {
      swiperFigure?.mousewheel.enable();
    } else {
      swiperFigure?.mousewheel.disable();
    }
  }

  function onSlideScroll(swiper: SwiperClass, event: WheelEvent) {
    const { lastTime, scrollSpeed } = wheelRef.current
    // 获取当前时间
    const currentTime = new Date().getTime();

    // 计算时间差
    const timeDiff = currentTime - lastTime;

    // 计算滚动速度
    if (timeDiff < 200) {
      wheelRef.current.scrollSpeed += event.deltaY * 0.01;
    } else {
      wheelRef.current.scrollSpeed = event.deltaY * 0.01;
    }

    // 更新最后滚动时间
    wheelRef.current.lastTime = currentTime;

    // 开始滚动动画
    requestAnimationFrame(scroll);
    if (swiper.isEnd) {
      swiperWrapper?.mousewheel.enable();
    } else {
      swiperWrapper?.mousewheel.disable();
    }
  }

  function scroll() {
    const { lastScrollTop, scrollSpeed } = wheelRef.current
    // 计算新的滚动位置
    const newScrollTop = lastScrollTop - scrollSpeed;

    // 滚动页面
    if (swiperFigure?.mousewheel.enabled){
      swiperFigure.setTranslate(newScrollTop);
    } else {
      swiperWrapper?.setTranslate(newScrollTop);
    }
    //  window.scrollTo(0, newScrollTop);

    // 减小滚动速度，模拟惯性效果
    wheelRef.current.scrollSpeed *= 0.95;

    // 更新最后滚动位置
    wheelRef.current.lastScrollTop = newScrollTop;

    // 如果滚动速度足够小，就停止动画
    if (Math.abs(scrollSpeed) > 0.05) {
      requestAnimationFrame(scroll);
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
        modules={[Mousewheel, FreeMode]}
        onScroll={onSlideScrollWrapper}
        freeMode={true}
        slidesPerView="auto"
        onSwiper={setSwiperWrapper}
      >
        <SwiperSlide>
          <div className="swiper-screen w-full h-screen relative">
            <div
              className={`absolute w-full h-screen z-[2] flex flex-col bg-black ${
                open ? 'referralInAnim' : 'referralOutAnim'
              } ${open === null ? 'hidden' : ''}`}
            >
              <div className="flex flex-1 shadow-[0px_0px_30px_10px_#514032]">
                <div className="w-1/2 flex items-end justify-start pl-[14.375rem] pb-[4rem] max-md:pl-8 max-md:pr-4 max-md:w-full">
                  <PageDesc
                    hasBelt
                    className="character-desc text-left whitespace-nowrap max-md:whitespace-normal"
                    title={`<span>${curFigure?.name}</span><br><span class="text-[#666]" >${curFigure?.subTitle}</span>`}
                    subtitle={curFigure?.introduce}
                  />
                </div>
                <div className="w-1/2 flex items-end justify-center max-md:hidden">
                  <Image
                    className="object-cover w-[40rem] h-[40.75rem]"
                    src={curFigure?.img!}
                    alt={curFigure?.name!}
                  ></Image>
                </div>
              </div>
              <div className="blank w-full h-[11.875rem] relative">
                <div
                  onClick={() => setOpen(!open)}
                  className="absolute bottom-full left-1/2 z-[3] -translate-x-1/2 translate-y-1/2 w-10 h-10 cursor-pointer"
                >
                  <span
                    className={`absolute text-xs top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-black z-10`}
                  >
                    <span>&#x2715;</span>
                  </span>
                  <span className="absolute font-semakin -bottom-[80%] -translate-x-1/2 left-1/2 text-[#F6C799]">
                    Close
                  </span>
                  <Image className="object-cover" src="/img/about/button@2x.png" alt="close" fill sizes="100%" />
                </div>
              </div>
            </div>
            <div className="absolute font-semakin w-full h-full flex items-center justify-center text-9xl text-[#17100A]">
              OUR TEAM
            </div>
            <Swiper
              className="w-full h-full"
              modules={[Mousewheel, FreeMode]}
              freeMode={{ enabled: true, sticky: false, momentum: true }}
              // slidesPerView={3}
              slidesPerView="auto"
              mousewheel={true}
              // breakpoints={{
              //   320: {
              //     slidesPerView: 1,
              //   },
              //   640: {
              //     // slidesPerView: 3
              //     slidesPerView: "auto"
              //   }
              // }}
              centeredSlides={true}
              onScroll={onSlideScroll}
              onSwiper={setSwiperFigure}
            >
              <SwiperSlide>
                <EntertainmentSlide needAni={true} />

                <div className="mask absolute left-[80vw] top-0 h-screen w-[40vw]"></div>
              </SwiperSlide>
              <SwiperSlide style={{ width: 'auto' }}><div className="w-[36vw] h-full"></div></SwiperSlide>
              {figureArray.map((figureData, index) => {
                return (
                  <SwiperSlide
                    style={{ width: 'auto' }}
                    className="flex items-center justify-start mr-[14.44rem]"
                    key={figureData.name}
                  >
                    <div
                      onClick={() => {
                        setCurFigure(figureData);
                        setOpen(true);
                      }}
                      className="transition-transform transform group w-[30.75rem]"
                    >
                      <Image
                        className="w-[30.75rem] h-[31.56rem] cursor-pointer group-hover:hover:scale-[1.1] duration-300"
                        src={figureData.img}
                        alt={figureData.name}
                      />
                      <div className="flex flex-col items-center text-[2rem] -translate-y-[2.1rem] font-semakin">
                        <span className="text-white mb-1 leading-none">{figureData.name}</span>
                        <span className="text-[#666] leading-none whitespace-nowrap">{figureData.subTitle}</span>
                      </div>
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
            <div className="scroll_btn max-sm:hidden w-[5vw] h-[5vw] rounded-full uppercase flex justify-center items-center border border-[#F6C799] text-[.8vw] text-[#F6C799] absolute top-1/2 -translate-y-1/2 right-[35vw] z-0">
              <div className="relative w-full h-full flex justify-center items-center">
                scroll
                <Image className="absolute -left-[.8vw] w-[.4vw] h-[.6vw]" src={rightArrows} alt="left" />
                <Image className="absolute -right-[.8vw] w-[.4vw] h-[.6vw]" src={leftArrows} alt="right" />
              </div>
            </div>
          </div>
        </SwiperSlide>
        <SwiperSlide style={{ minHeight: '100vh', height: 'auto' }}>
          <div
            ref={containerRef}
            className="w-full friendLink_wrap bg-black flex flex-col justify-center items-center bg-aboutBg bg-center"
          >
            <div
              className={`friendLink_title uppercase max-sm:text-[2rem] text-[3.75rem] font-semakin leading-none mb-[4rem] translate-y-[16px] fill-mode-[both] ${isVisiable && 'slideInAnim'
                }`}
            >
              Investors & Partners
            </div>
            <div className={`friends translate-y-[16px] fill-mode-[both] ${isVisiable && 'slideInAnim'}`}>
              <ul className="max-md:gap-[1.5rem] gap-[2.38rem] grid grid-cols-5 max-md:grid-cols-2">
                {sponsorArray.map((value, index) => {
                  if (index === 10) return;

                  return (
                    <li key={index} className="max-sm:h-[3rem] w-[11.25rem] h-[5.53rem] relative">
                      <Image className="object-cover" src={`/img/about/${index + 1}.png`} alt="" fill sizes="100%" />
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
