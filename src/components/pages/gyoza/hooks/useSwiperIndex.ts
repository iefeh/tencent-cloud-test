import { useEffect, useState } from "react";

export interface SwiperIndexProps {
  aimIndex: number;
  prevIndex: number;
  sliderIndex: number;
}

export enum SliderAnimationType {
  FADE_IN = "fadeIn",
  FADE_OUT = "fadeOut",
  NONE_CHANGE = "noneChange",
}

const useSwiperIndex = (props: SwiperIndexProps) => {
  const { aimIndex, prevIndex, sliderIndex } = props;

  const [aniSts, setAniSts] = useState<`${SliderAnimationType}`>(SliderAnimationType.NONE_CHANGE)

  useEffect(() => {
    if (prevIndex === aimIndex) {
      setAniSts(SliderAnimationType.NONE_CHANGE)
    } else if (prevIndex === sliderIndex) {
      setAniSts(SliderAnimationType.FADE_OUT)
    } else if (aimIndex === sliderIndex) {
      setAniSts(SliderAnimationType.FADE_IN)
    } else {
      setAniSts(SliderAnimationType.NONE_CHANGE)
    }

  }, [aimIndex, prevIndex, sliderIndex])

  return {
    aniSts
  }
}

export default useSwiperIndex;