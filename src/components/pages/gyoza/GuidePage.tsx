import React, { FC, useEffect, useMemo, useRef, useState } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Mousewheel } from 'swiper/modules';
import FlamingHome from './sliders/FlamingHome'
import GyozaPVP from './sliders/GyozaPVP'
import GyozaCastle from './sliders/GyozaCastle'
import GyozaAttack from './sliders/GyozaAttack'
import GyozaPlay from './sliders/GyozaPlay'
import DataPage from "./sliders/DataPage";
import DataAniPage from "./sliders/DataAniPage";
import { GostButton, BaseButton } from "./Buttons/gostButton";
import { cn } from '@nextui-org/react';
import styles from './index.module.scss'
import S3Image from "@/components/common/medias/S3Image";
import SwiperEl from 'swiper';
import { isMobile } from 'react-device-detect';

interface GuidePageProps {
  setShowMask: (show: boolean) => void;
}
const scrollImgUrl = '/minigames/miner/icon_scroll_down.png'

const GuidePage: FC<GuidePageProps> = (props) => {
  const { setShowMask } = props
  let swiperRef = useRef<SwiperEl | null>(null);

  const [swiperInfo, setSwiperInfo] = useState({
    swiperIndex: 0,
    prevSwiperIndex: 0
  })

  const toNextSlide = () => {
    swiperRef.current?.slideNext()
  }

  const toPrevSlide = () => {
    swiperRef.current?.slidePrev()
  }

  const toSkipSlide = () => {
    swiperRef.current?.slideTo(sliders.length - 1)
    setShowMask(true)
  }

  const { sliders } = useMemo(() => {
    const { swiperIndex, prevSwiperIndex } = swiperInfo;

    return {
      sliders: [
        <FlamingHome
          key={0}
          aimIndex={swiperIndex}
          prevIndex={prevSwiperIndex}
          sliderIndex={0}
        ></FlamingHome>,
        <GyozaPVP key={1} toPrev={toSkipSlide} toNext={toNextSlide}></GyozaPVP>,
        <GyozaCastle key={2} toPrev={toPrevSlide} toNext={toNextSlide}></GyozaCastle>,
        <GyozaAttack key={3} toPrev={toPrevSlide} toNext={toNextSlide}></GyozaAttack>,
        <GyozaPlay
          key={4}
          toPrev={toSkipSlide}
          aimIndex={swiperIndex}
          prevIndex={prevSwiperIndex}
          sliderIndex={4}
          setShowMask={setShowMask}
        ></GyozaPlay>,
        <DataPage key={5}></DataPage>
      ]
    }
  }, [swiperInfo])

  return (
    <>
      <DataAniPage
        aimIndex={swiperInfo.swiperIndex}
        prevIndex={swiperInfo.prevSwiperIndex}
        sliderIndex={5}
      />

      <Swiper
        className="relative h-full w-full"
        direction="vertical"
        speed={1500}
        mousewheel={true}
        freeMode={isMobile}
        modules={[Mousewheel, FreeMode]}
        slidesPerView="auto"
        onSwiper={(swiper) => swiperRef.current = swiper}
        onSlideChangeTransitionStart={(swiper) => {
          setSwiperInfo({
            swiperIndex: swiper.realIndex,
            prevSwiperIndex: swiper.previousIndex,
          })
        }}
        onSlideChangeTransitionEnd={(swiper) => {
          setSwiperInfo({
            swiperIndex: swiper.realIndex,
            prevSwiperIndex: swiper.previousIndex,
          })
        }}
      >
        {
          sliders.map((SliderComp, index) => (
            <SwiperSlide className={cn([index === sliders.length - 1 && "!h-auto"])} key={index}>
              {SliderComp}
            </SwiperSlide >
          ))
        }

        <div className={
          cn([
            styles.arrowAni,
            'absolute bottom-[3.3125rem] left-1/2 translate-x-1/2',
            'text-xs transition-all !duration-1000 opacity-100',
            swiperInfo.swiperIndex == sliders.length - 1 && '!opacity-0',
          ])
        } >
          <S3Image className="w-[1.8125rem] h-[1.3125rem] mb-3 mx-auto" src={scrollImgUrl} alt="" />
          Scroll down
        </div>

        <div className={cn([
          "bg-[url('https://d3dhz6pjw7pz9d.cloudfront.net/minigames/miner/bg_float.png')] bg-[length:100%_auto] bg-no-repeat",
          'absolute bottom-0 left-0 w-full h-[9.3125rem] z-20 pointer-events-none'
        ])}>
          <div className="pointer-events-auto inline-block absolute bottom-4 right-[23.75rem]">
            <BaseButton className="mr-3">Play Now</BaseButton>
            <GostButton>xxx</GostButton>
          </div>
        </div>
      </Swiper >
    </>

  )
}

export default GuidePage;