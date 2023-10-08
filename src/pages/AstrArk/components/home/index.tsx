import React, { useCallback, useEffect, useRef, useState } from "react";

interface Props {
  toDisable: () => any;
  toEnable: () => any;
}

const AstrarkHome: React.FC<Props> = (props) => {
  const { toDisable, toEnable } = props

  const [showVideo, setShowVideo] = useState(false) 
  const textDomRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    toDisable()
  }, [])
  
  const getScaleVale = () => {
    if (!textDomRef.current) return 1

    const tr = getComputedStyle(textDomRef.current).transform
    const values = tr.split('(')[1].split(')')[0].split(',');
    const a = Number(values[0]);
    const b = Number(values[1]);

    const scale = Math.sqrt(a * a + b * b);
    
    return scale || 1
  }

  const scrollControl = (e: WheelEvent) => {
    let down = true
    down = e.wheelDelta ? e.wheelDelta < 0: e.detail > 0

    const curScale = getScaleVale()

    if (curScale > 2) {
      setShowVideo(true)
      return toEnable()
    }
    if (down) { // 放大字体
      if (textDomRef.current) {
        textDomRef.current.style.transform = `scale(${curScale+0.1})`
      }
    } else { // 缩小字体
      if (textDomRef.current) {
        if (curScale <= 1) return
        textDomRef.current.style.transform = `scale(${curScale-0.1})`
      }
    }
  }

  useEffect(() => {
    window.addEventListener('wheel', scrollControl)
  }, [])

  return (
    <>
      { showVideo
      ? <video
          className="w-full object-cover"
          style={{ height: 'calc(100% - 2px)' }}
          src="/video/astrark.mp4"
          autoPlay
          muted
          loop
        ></video>
      : <span ref={textDomRef} className="homeBg uppercase font-semakin inline-block m-auto">
          AstrArk
        </span>
      }
    </>
   
  );
};

export default AstrarkHome;
