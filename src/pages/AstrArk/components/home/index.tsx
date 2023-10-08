import React, { useCallback, useEffect, useRef, useState } from "react";
import arrowImg from "img/astrark/arrow.png";
import Image from "next/image";

interface Props {
  toDisable: () => any;
  toEnable: () => any;
}

const AstrarkHome: React.FC<Props> = (props) => {
  const { toDisable, toEnable } = props;
  const [showFullVideo, setShowFullVideo] = useState(false);
  const textDomRef = useRef<HTMLDivElement>(null);
  const maxScale = 6;
  const maxAutoScale = 20;
  const scaleAniDuration = 300;
  const autoAniDuration = 500;
  const fpsSec = 16.6667;
  let currenScale = 1;
  let targetScale = 1;
  let currenOpacity = 1;
  let targetOpacity = 0;
  let scalePf = 0;
  let opacityPf = 0;

  useEffect(() => {
    toDisable();
  }, []);

  const runAutoAni = () => {
    if (!textDomRef.current) return;
    if (currenScale >= maxAutoScale) {
      setShowFullVideo(true);
      window.removeEventListener("wheel", scrollControl);
      toEnable();
      return;
    }

    currenScale += scalePf;
    currenOpacity += opacityPf;
    textDomRef.current.style.transform = `scale(${currenScale})`;
    textDomRef.current.style.opacity = currenOpacity + "";
    requestAnimationFrame(runAutoAni);
  };

  const runScaleAni = () => {
    if (!textDomRef.current) return;

    if (Math.abs(currenScale - targetScale) < 0.05) {
      currenScale = targetScale;
      textDomRef.current.style.transform = `scale(${currenScale})`;
      if (currenScale >= maxScale) {
        targetScale = maxAutoScale;
        scalePf = ((targetScale - currenScale) * fpsSec) / autoAniDuration;
        opacityPf =
          ((targetOpacity - currenOpacity) * fpsSec) / autoAniDuration;
        currenOpacity = 1;
        targetOpacity = 0;
        runAutoAni();
      }
      return;
    }

    currenScale += scalePf;
    textDomRef.current.style.transform = `scale(${currenScale})`;
    requestAnimationFrame(runScaleAni);
  };

  const scrollControl = (e: WheelEvent) => {
    if (e.deltaY === 0) return;

    const scaleDiff = (e.deltaY / scaleAniDuration) * maxScale;
    targetScale = Math.max(1, Math.min(maxScale, targetScale + scaleDiff));
    scalePf = ((targetScale - currenScale) * fpsSec) / scaleAniDuration;
    runScaleAni();
  };

  useEffect(() => {
    window.addEventListener("wheel", scrollControl);

    return () => window.removeEventListener("wheel", scrollControl);
  }, []);

  return (
    <div className="astrark-home relative w-full h-screen flex justify-center items-center">
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

      {showFullVideo || (
        <div
          ref={textDomRef}
          className="text uppercase text-[18rem] font-semakin absolute left-0 top-0 flex justify-center items-center w-full h-full bg-black text-white text-center mix-blend-multiply z-10 origin-center"
        >
          AstrArk
        </div>
      )}

      <Image
        className="w-[3.1875rem] h-[1.75rem] absolute left-1/2 -translate-x-1/2 bottom-[4.5625rem] z-20"
        src={arrowImg}
        alt=""
      />
    </div>
  );
};

export default AstrarkHome;
