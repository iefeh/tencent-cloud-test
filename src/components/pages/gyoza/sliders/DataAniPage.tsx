import { FC, CSSProperties, useEffect } from "react";
import useSwiperIndex, { type SwiperIndexProps, SliderAnimationType } from "../hooks/useSwiperIndex";
import S3Image from '@/components/common/medias/S3Image';
import { cn } from '@nextui-org/react';
interface DataAniPageProps extends SwiperIndexProps {

}

const getUrl = (name: string) => {
  return `/minigames/miner/${name}.png`
}

const bgImgList = [
  {
    url: getUrl('cannon'),
    classNames: 'w-[37.3125rem] h-[27.5rem] top-[8.0625rem] right-0',
    styles: {
      '--translate-x': '100%',
      '--translate-y': '0',
      '--translate-duration': '1s',
    }
  },
  {
    url: getUrl('castle'),
    classNames: 'w-[867px] h-[40.625rem] bottom-0 left-0',
    styles: {
      '--translate-x': '-100%',
      '--translate-y': '0',
      '--duration-time': '2s',
    }
  },
]

const DataAniPage: FC<DataAniPageProps> = (props) => {
  const { aimIndex, prevIndex, sliderIndex } = props

  const { aniSts } = useSwiperIndex({
    aimIndex,
    prevIndex,
    sliderIndex,
  })

  return (
    <>
      {
        bgImgList.map((img, index) => (
          <S3Image
            key={index}
            src={img.url}
            style={img.styles as CSSProperties}
            className={cn([
              img.classNames,
              aniSts === SliderAnimationType.FADE_IN && 'ani-fade-in',
              aniSts === SliderAnimationType.FADE_OUT && 'ani-fade-out',
              aniSts === SliderAnimationType.NONE_CHANGE && 'hidden',
              'fixed object-contain z-[-1]'
            ])} />
        ))
      }
    </>
  )
}

export default DataAniPage;