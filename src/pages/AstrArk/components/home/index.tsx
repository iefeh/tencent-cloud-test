import React, { MutableRefObject, useLayoutEffect, useRef } from 'react';
import arrowImg from 'img/astrark/arrow.png';
import Image from 'next/image';
import { Scrollbar } from 'smooth-scrollbar/scrollbar';
// import LogoSvg from "svg/logo.svg";
import styles from './index.module.css';

interface Props {
  onScrollStatusChange: (enable: boolean) => void;
}

function easeOutQuad(t: number, b: number, c: number, d: number) {
  return -c * (t /= d) * (t - 2) + b;
}

const AstrarkHome: React.FC<Props> = (props) => {
  const { onScrollStatusChange } = props;
  const videoRef = useRef<HTMLDivElement>(null);
  const rafId = useRef(0);
  const maxScale = 30;
  const maxStaticScale = 25;
  let scaleAniDuration = 1000;
  let startScale = 1;
  let targetScale = 1;
  let currenScale = 1;
  let els = 0;

  const runScaleAni = (curEl: number = els) => {
    if (!videoRef.current) return;

    let scale = 0;
    let isEnd = false;

    if (startScale < targetScale) {
      scale = easeOutQuad(curEl - els, startScale, targetScale, scaleAniDuration);
      isEnd = scale > targetScale || scale < startScale;
    } else {
      scale = targetScale + startScale - easeOutQuad(curEl - els, targetScale, startScale, scaleAniDuration);
      isEnd = scale < targetScale || scale > startScale;
    }

    if (isEnd || Math.abs(targetScale - scale) < 0.05) {
      scale = targetScale;
      startScale = targetScale;
      isEnd = true;
    }
    if (scale >= maxStaticScale) {
      onScrollStatusChange(true);
    }

    currenScale = scale;
    videoRef.current.style.setProperty('--mask-size', `${80 * scale}%`);
    videoRef.current.style.setProperty('--mask-pos-y', `${50 + (20 * (scale - 1)) / maxScale}%`);
    if (!isEnd) {
      rafId.current = requestAnimationFrame(runScaleAni);
    }
  };

  const scrollControl = (e: WheelEvent) => {
    if (e.deltaY === 0) return;

    const scaleDiff = (e.deltaY / scaleAniDuration) * maxScale;
    const nextTargetScale = Math.max(1, Math.min(maxScale, targetScale + scaleDiff));
    if (targetScale === nextTargetScale) return;

    targetScale = nextTargetScale;
    scaleAniDuration = (1000 * Math.sqrt(Math.abs(targetScale - currenScale))) / 4;
    startScale = currenScale;
    els = performance.now();
    if (rafId.current > 0) cancelAnimationFrame(rafId.current);
    runScaleAni();
  };

  useLayoutEffect(() => {
    if (!videoRef.current) return;

    videoRef.current.style.setProperty('--mask-size', '80%');
    videoRef.current.style.setProperty('--mask-pos-y', '50%');
  }, []);

  return (
    <div
      className="astrark-home relative w-full h-screen flex justify-center items-center overflow-hidden"
      onWheel={(e) => scrollControl(e as any)}
    >
      <div ref={videoRef} className={"absolute left-0 top-0 w-full h-full z-0 " + styles.maskVideo}>
        <video
          className="object-cover w-full h-full"
          autoPlay
          playsInline
          muted
          loop
          preload="auto"
        >
          <source src="/video/astrark.mp4" />
        </video>

        <div className={"absolute w-full h-1/2 left-0 bottom-0 z-10 " + styles.videoShadow}></div>
      </div>

      <Image
        className={
          'w-[3.1875rem] h-[1.75rem] absolute left-1/2 -translate-x-1/2 bottom-[4.5625rem] z-20 ' + styles.arrowImg
        }
        src={arrowImg}
        alt=""
      />
    </div>
  );
};

export default AstrarkHome;
