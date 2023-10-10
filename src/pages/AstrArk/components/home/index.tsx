import React, { MutableRefObject, useEffect, useRef, useState } from 'react';
import arrowImg from 'img/astrark/arrow.png';
import Image from 'next/image';
import { Scrollbar } from 'smooth-scrollbar/scrollbar';

interface Props {
  sbRef: MutableRefObject<Scrollbar | undefined>;
  onScrollStatusChange: (enable: boolean) => void;
}

const AstrarkHome: React.FC<Props> = (props) => {
  const { sbRef, onScrollStatusChange } = props;
  const textDomRef = useRef<HTMLDivElement>(null);
  const maxScale = 30;
  const scaleAniDuration = 1000;
  const fpsSec = 16.6667;
  let currenScale = 1;
  let targetScale = 1;
  let currenOpacity = 1;
  let scalePf = 0;
  let opacityPf = 0;

  const runScaleAni = () => {
    if (!textDomRef.current) return;
    if (currenScale === targetScale) return;

    if (Math.abs(currenScale - targetScale) < 0.02) {
      currenScale = targetScale;
      if (targetScale === maxScale) {
        onScrollStatusChange(true);
      } else {
        onScrollStatusChange(false);
      }
    } else {
      currenScale += scalePf;
      currenOpacity += opacityPf;
    }

    textDomRef.current.style.transform = `scale(${currenScale})`;
    textDomRef.current.style.opacity = currenOpacity + '';
    requestAnimationFrame(runScaleAni);
  };

  const scrollControl = (e: WheelEvent) => {
    if (e.deltaY === 0) return;

    if (currenScale < maxScale) {
      e.stopPropagation();
    }

    const scaleDiff = (e.deltaY / scaleAniDuration) * maxScale;
    const nextTargetScale = Math.max(1, Math.min(maxScale, targetScale + scaleDiff));
    if (targetScale === nextTargetScale) return;

    targetScale = nextTargetScale;
    scalePf = ((targetScale - currenScale) * fpsSec) / scaleAniDuration;
    runScaleAni();
  };

  return (
    <div
      className="astrark-home relative w-full h-screen flex justify-center items-center overflow-hidden"
      onWheel={(e) => scrollControl(e as any)}
    >
      <video
        className="object-cover absolute left-0 top-0 w-full h-full z-0"
        autoPlay
        playsInline
        muted
        loop
        preload="auto"
      >
        <source src="/video/astrark.mp4" />
      </video>

      <div
        ref={textDomRef}
        className="text uppercase text-[18rem] font-semakin absolute left-0 top-0 flex justify-center items-center w-full h-full bg-black text-white text-center mix-blend-multiply z-10 origin-center"
      >
        AstrArk
      </div>

      <Image
        className="w-[3.1875rem] h-[1.75rem] absolute left-1/2 -translate-x-1/2 bottom-[4.5625rem] z-20"
        src={arrowImg}
        alt=""
      />
    </div>
  );
};

export default AstrarkHome;
