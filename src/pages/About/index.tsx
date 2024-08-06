'use client';
import Image from 'next/image';
import { Swiper, SwiperClass, SwiperSlide } from 'swiper/react';
import { useEffect, useRef, useState } from 'react';
import { FreeMode, Mousewheel } from 'swiper/modules';
import { IntersectionObserverHook } from '@/hooks/intersectionObserverHook';
import PageDesc from '../../components/common/PageDesc';
import Head from 'next/head';
import EntertainmentSlide from './EntertainmentSlide';
import { scrollRef, scrollStart } from '../../hooks/scroll';

interface Figure {
  img: string;
  width: number;
  height: number;
  name: string;
  subTitle: string;
  introduce: string;
}

const figureArray: Figure[] = [
  {
    img: 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/about/team/team_mj.png',
    width: 1153,
    height: 1200,
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
    img: 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/about/team/team_jw.png',
    name: 'Jason',
    width: 1135,
    height: 900,
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
    img: 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/about/team/team_chris.png',
    name: 'Chris',
    width: 492,
    height: 505,
    subTitle: 'Head of Game Dev',
    introduce: `<div class="subtitle text-left whitespace-nowrap" >
  <p>- Formerly CTO at Riot Games China</p>
  <p>- Formerly Engineering Director at Lilith Games</p>
  <p>- Formerly Principal Software Architect at Roblox Inc., Machine Zone, CCP Games, Crytek GmbH</p>
  <p>- 20+ years international industry experiences in game engine tech, MMO server tech, development processes, team building, etc</p>
</div>`,
  },
  {
    img: 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/about/team/team_mason.png',
    name: 'Mason Z',
    width: 1127,
    height: 1118,
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
    img: 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/about/team/team_robin.png',
    name: 'Robin Z',
    width: 989,
    height: 1042,
    subTitle: 'Web 3 Producer',
    introduce: `<div class="subtitle text-left whitespace-nowrap" >
  <p>- DeFi project builder</p>
  <p>- Crypto native since 2014</p>
  <p>- 7 years full-stack mobile-game dev & production experience</p>
  <p>- Game collector</p>
  <p>- Vim lover</p>
  <p>- Servant of the Art Director</p>
</div>`,
  },
  {
    img: 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/about/team/team_puff.png',
    name: 'Puff Z',
    width: 1034,
    height: 1024,
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

const sponsorArray = [
  'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/about/investors/spartan.png',
  '/img/about/1.png',
  'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/about/investors/animoca.png',
  '/img/about/3.png',
  'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/about/investors/hashkey.png',

  'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/about/investors/hivemind.png',
  '/img/about/5.png',
  '/img/about/6.png',
  'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/about/investors/mask.png',
  '/svg/investors/ventures.svg',
  // '/img/about/2.png',

  '/img/about/4.png',
  '/img/about/8.png',
  '/img/about/7.png',
  '/img/about/9.png',
  '/img/about/10.png',

  '/img/about/12.png',
  '/img/about/13.png',
  '/img/about/14.png',
  '/img/about/15.png',
  '/img/about/16.png',

  '/img/about/17.png',
  '/img/about/18.png',
  '/img/about/19.png',
  '/img/about/20.png',
  '/img/about/21.png',

  '/img/about/22.png',
];

export default function About({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const containerRef = useRef(null);
  const transverseRef = useRef<scrollRef>({ lastTime: 0, scrollSpeed: 0, cancelId: 0, lastScroll: 0 });
  const longitudinalRef = useRef<scrollRef>({ lastTime: 0, scrollSpeed: 0, cancelId: 0, lastScroll: 0 });
  const isVisiable = IntersectionObserverHook({ currentRef: containerRef });
  const [curFigure, setCurFigure] = useState<Figure>(figureArray[0]);
  const [open, setOpen] = useState<boolean | null>(null);
  const [swiperWrapper, setSwiperWrapper] = useState<SwiperClass>();
  const [swiperFigure, setSwiperFigure] = useState<SwiperClass>();

  function onSlideScrollWrapper(swiper: SwiperClass, event: WheelEvent) {
    scrollStart(event, longitudinalRef, swiper);

    if (swiper.translate === 0) {
      swiperFigure?.mousewheel?.enable();
    } else {
      swiperFigure?.mousewheel?.disable();
    }
  }

  function onSlideScroll(swiper: SwiperClass, event: WheelEvent) {
    scrollStart(event, transverseRef, swiper);

    if (swiper.isEnd) {
      swiperWrapper?.mousewheel?.enable();
    } else {
      swiperWrapper?.mousewheel?.disable();
    }
  }

  useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      cancelAnimationFrame(transverseRef.current.cancelId);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      cancelAnimationFrame(longitudinalRef.current.cancelId);
    };
  }, []);

  return (
    <div className="about w-full h-screen flex flex-col items-center justify-between">
      <Head>
        <title>About | Moonveil Entertainment</title>

        {figureArray.map((item, index) => (
          <link key={index} rel="preload" as="image" href={item.img} crossOrigin="anonymous"></link>
        ))}

        {/* {sponsorArray.map((item, index) => (
          <link
            key={index}
            rel="preload"
            as="image"
            href={item}
            type={item.endsWith('svg') ? 'image/svg+xml' : undefined}
            crossOrigin="anonymous"
          ></link>
        ))} */}
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
                  <div className="w-[40rem] h-[40.75rem] relative">
                    <Image className="object-cover" src={curFigure?.img!} alt={curFigure?.name!} fill unoptimized />
                  </div>
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
                <EntertainmentSlide />

                <div className="mask absolute left-[80vw] top-0 h-screen w-[40vw]"></div>
              </SwiperSlide>
              <SwiperSlide style={{ width: 'auto' }}>
                <div className="w-[36vw] h-full"></div>
              </SwiperSlide>
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
                        className="w-auto h-[31.56rem] cursor-pointer group-hover:hover:scale-[1.1] duration-300"
                        src={figureData.img}
                        alt={figureData.name}
                        width={figureData.width}
                        height={figureData.height}
                        unoptimized
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
            <div className="scroll_btn max-sm:hidden w-24 h-24 rounded-full uppercase flex justify-center items-center border border-[#F6C799] text-[0.9375rem] text-[#F6C799] absolute top-1/2 -translate-y-1/2 right-[35vw] z-0">
              <div className="relative w-full h-full flex justify-center items-center">
                scroll
                <Image
                  className="absolute -left-4 w-[0.4375rem] h-[0.75rem]"
                  src="img/about/arrow_2.png"
                  alt="left"
                  width={7}
                  height={12}
                  priority
                  unoptimized
                />
                <Image
                  className="absolute -right-4 w-[0.4375rem] h-[0.75rem]"
                  src="img/about/arrow_1.png"
                  alt="right"
                  width={7}
                  height={12}
                  priority
                  unoptimized
                />
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
              className={`friendLink_title uppercase max-sm:text-[2rem] text-[3.75rem] font-semakin leading-none mb-[4rem] translate-y-[16px] fill-mode-[both] ${
                isVisiable && 'slideInAnim'
              }`}
            >
              Investors & Partners
            </div>
            <div className={`friends translate-y-[16px] fill-mode-[both] ${isVisiable && 'slideInAnim'}`}>
              <ul className="max-md:gap-[1.5rem] gap-[2.38rem] grid grid-cols-5 max-md:grid-cols-2">
                {sponsorArray.map((value, index) => {
                  return (
                    <li key={index} className="max-sm:h-[3rem] w-[11.25rem] h-[5.53rem] relative">
                      <Image
                        className={value.endsWith('svg') ? 'object-contain' : 'object-cover'}
                        src={value}
                        alt=""
                        fill
                        sizes="100%"
                        priority
                        unoptimized
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
