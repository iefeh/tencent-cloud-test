import React, { FC, useMemo, useRef } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Mousewheel } from 'swiper/modules';
import FlamingHome from './sliders/FlamingHome'
import GyozaPVP from './sliders/GyozaPVP'
import GyozaCastle from './sliders/GyozaCastle'
import GyozaAttack from './sliders/GyozaAttack'
import GyozaPlay from './sliders/GyozaPlay'
import { GostButton, BaseButton } from "./Buttons/gostButton";
import { cn } from '@nextui-org/react';
import styles from './index.module.scss'
import S3Image from "@/components/common/medias/S3Image";
import SwiperEl from 'swiper';

interface GuidePageProps {
  toSkip: () => void
}

const scrollImgUrl = '/minigames/miner/icon_scroll_down.png'

const GuidePage: FC<GuidePageProps> = (props) => {
  const { toSkip } = props
  let swiperRef = useRef<SwiperEl | null>(null);

  const toNextSlide = () => {
    swiperRef.current?.slideNext()
  }

  const toPrevSlide = () => {
    swiperRef.current?.slidePrev()
  }

  const toSkipSlide = () => {
    toSkip()
  }

  const { sliders } = useMemo(() => {
    return {
      sliders: [
        <FlamingHome></FlamingHome>,
        <GyozaPVP toPrev={toSkipSlide} toNext={toNextSlide}></GyozaPVP>,
        <GyozaCastle toPrev={toPrevSlide} toNext={toNextSlide}></GyozaCastle>,
        <GyozaAttack toPrev={toPrevSlide} toNext={toNextSlide}></GyozaAttack>,
        <GyozaPlay toPrev={toSkipSlide} ></GyozaPlay>
      ]
    }
  }, [])

  return (
    <Swiper
      className="relative h-full w-full"
      direction="vertical"
      slidesPerView={1}
      mousewheel={true}
      modules={[Mousewheel, FreeMode]}
      onSwiper={(swiper) => swiperRef.current = swiper}
    >
      {sliders.map((SliderComp, index) => (
        <SwiperSlide key={index}>
          {SliderComp}
        </SwiperSlide>
      ))}

      <div className={cn([
        styles.arrowAni,
        'absolute bottom-[3.3125rem] left-1/2 translate-x-1/2',
        'text-xs'
      ])}>
        <S3Image className="w-[1.8125rem] h-[1.3125rem] mb-3 mx-auto" src={scrollImgUrl} alt="" />
        Scroll down
      </div>

      <div className={cn([
        "bg-[url('https://moonveil-public.s3.ap-southeast-2.amazonaws.com/minigames/miner/bg_float.png')] bg-[length:100%_auto] bg-no-repeat",
        'absolute bottom-0 left-0 w-full h-[9.3125rem] z-20 pointer-events-none'
      ])}>
        <div className="pointer-events-auto inline-block absolute bottom-4 right-[23.75rem]">
          <BaseButton onClick={toSkip} className="mr-3">Play Now</BaseButton>
          <GostButton>xxx</GostButton>
        </div>
      </div>
    </Swiper >
  )
}

export default GuidePage;