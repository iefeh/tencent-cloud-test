import React, { FC, useMemo } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Mousewheel } from 'swiper/modules';
import FlamingHome from './sliders/FlamingHome'
import GyozaPVP from './sliders/GyozaPVP'
import GyozaCastle from './sliders/GyozaCastle'
import GyozaAttack from './sliders/GyozaAttack'
import GyozaPlay from './sliders/GyozaPlay'
import { GostButton, BaseButton } from "./Buttons/gostButton";
import { cn } from '@nextui-org/react';
import { Image } from "@nextui-org/react";
import styles from './index.module.scss'
interface GuidePageProps {

}

const scrollImgUrl = ''

const GuidePage: FC<GuidePageProps> = (props) => {
  // const {} = props

  const toNextSlide = () => { }

  const toPrevSlide = () => { }

  const toSkipSlide = () => { }

  const { sliders } = useMemo(() => {
    return {
      sliders: [
        // <FlamingHome></FlamingHome>,
        // <GyozaPVP toPrev={toSkipSlide} toNext={toNextSlide}></GyozaPVP>,
        // <GyozaCastle toPrev={toPrevSlide} toNext={toNextSlide}></GyozaCastle>,
        // <GyozaAttack toPrev={toPrevSlide} toNext={toNextSlide}></GyozaAttack>,
        <GyozaPlay toPrev={toSkipSlide} toNext={toNextSlide}></GyozaPlay>
      ]
    }
  }, [])

  return (
    <Swiper
      className="relative h-full w-full"
      direction="vertical"
      slidesPerView={1}
      // mousewheel={true}
      modules={[Mousewheel, FreeMode]}
    >
      {sliders.map((SliderComp, index) => (
        <SwiperSlide key={index}>
          {SliderComp}
        </SwiperSlide>
      ))}

      <div className={cn([
        styles.arrowAni,
        'absolute bottom-[3.3125rem] left-1/2 translate-x-1/2 z-20',
        'text-xs'
      ])}>
        <Image className="w-[1.8125rem] h-[1.3125rem] mb-3" src={scrollImgUrl} alt="" />
        Scroll down
      </div>

      <div className={cn([
        "bg-[url('')] bg-[length:100%_auto] bg-no-repeat",
        'absolute bottom-0 left-0 w-full h-[9.3125rem] z-20'
      ])}>
        <div className="inline-block absolute bottom-4 right-[23.75rem]">
          <BaseButton className="mr-3">Play Now</BaseButton>
          <GostButton>xxx</GostButton>
        </div>
      </div>
    </Swiper >
  )
}

export default GuidePage;