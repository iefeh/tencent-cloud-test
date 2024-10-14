import React, { FC, CSSProperties } from "react";
import S3Image from '@/components/common/medias/S3Image';
import { cn } from "@nextui-org/react";
import useSwiperIndex, { type SwiperIndexProps, SliderAnimationType } from "../hooks/useSwiperIndex";

interface FlamingHomeProps extends SwiperIndexProps {

}

const getUrl = (name: string) => {
  return `/minigames/miner/${name}.png`
}

const aniTime = 1.5

const imgUrls = [
  {
    url: getUrl('title'),
    classNames: 'w-[34.625rem] h-[15.375rem] top-[16.125rem] right-[50%] translate-x-1/2',
    outStyles: {},
  },
  {
    url: getUrl('subtitle'),
    classNames: 'w-[54rem] h-[10.9375rem] top-[33.1875rem] right-[50%] translate-x-1/2',
    styles: {}
  },
]

const videoUrls = [
  {
    url: '/video/boat.webm',
    poster: getUrl('cannon'),
    classNames: 'w-full h-full top-[-2rem] right-[-7rem]',
    styles: {
      '--translate-x': '100%',
      '--translate-y': '0',
      '--duration-time': `${aniTime}s`
    },
  },
  {
    url: '/video/cat.webm',
    poster: getUrl('castle'),
    classNames: 'w-full h-full bottom-0 left-[-7rem]',
    styles: {
      '--translate-x': '-100%',
      '--translate-y': '0',
      '--duration-time': `${aniTime}s`
    }
  },
]

const FlamingHome: FC<FlamingHomeProps> = (props) => {
  const { aimIndex, prevIndex, sliderIndex } = props || {}

  const { aniSts } = useSwiperIndex({
    aimIndex,
    prevIndex,
    sliderIndex,
  })

  return (
    <div>
      {videoUrls.map((video, index) => (
        <video
          key={index}
          style={video.styles as CSSProperties}
          className={cn([
            'absolute object-contain',
            aniSts === SliderAnimationType.FADE_IN && 'ani-fade-in',
            aniSts === SliderAnimationType.FADE_OUT && 'ani-fade-out',
            video.classNames
          ])}
          autoPlay
          playsInline
          muted
          loop
          preload="auto"
          poster={video.poster}
        >
          <source src={video.url} />
        </video>
      ))
      }

      <div
        style={{
          '--translate-x': '0',
          '--translate-y': '0',
          '--duration-time': `${aniTime}s`
        } as CSSProperties}
        className={cn([
          aniSts === SliderAnimationType.FADE_IN && 'ani-fade-in',
          aniSts === SliderAnimationType.FADE_OUT && 'ani-fade-out',
        ])}
      >
        {imgUrls.map((img, index) => {
          return (
            <S3Image key={index} src={img.url} className={cn(['absolute object-contain', img.classNames])} />
          )
        })}
      </div>
    </div >

  )
}

export default FlamingHome;