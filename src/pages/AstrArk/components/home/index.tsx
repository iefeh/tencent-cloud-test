import React, { useEffect, useLayoutEffect, useRef } from 'react';
import arrowImg from 'img/astrark/arrow.png';
import Image from 'next/image';
import styles from './index.module.css';
import maskBg from 'img/astrark/bg-mask.png';

interface Props {
  scrollY: number;
}

function easeOutQuad(t: number, b: number, c: number, d: number) {
  return -c * (t /= d) * (t - 2) + b;
}

const AstrarkHome: React.FC<Props> = (props) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const rafId = useRef(0);
  const maxScale = 30;
  const scaleAniDuration = useRef(1000);
  const startScale = useRef(1);
  const targetScale = useRef(1);
  const currenScale = useRef(1);
  const els = useRef(0);

  const runScaleAni = (curEl: number = els.current) => {
    if (!videoRef.current) return;

    let scale = 0;
    let isEnd = false;

    if (startScale < targetScale) {
      scale = easeOutQuad(curEl - els.current, startScale.current, targetScale.current, scaleAniDuration.current);
      isEnd = scale > targetScale.current || scale < startScale.current;
    } else {
      const deltaScale = easeOutQuad(
        curEl - els.current,
        targetScale.current,
        startScale.current,
        scaleAniDuration.current,
      );
      scale = targetScale.current + startScale.current - deltaScale;
      isEnd = scale < targetScale.current || scale > startScale.current;
    }

    if (isEnd || Math.abs(targetScale.current - scale) < 0.05) {
      scale = targetScale.current;
      startScale.current = targetScale.current;
      isEnd = true;
    }

    currenScale.current = scale;
    videoRef.current.style.setProperty('--mask-size', `${80 * scale}%`);
    videoRef.current.style.setProperty('--mask-pos-y', `${50 + (20 * (scale - 1)) / maxScale}%`);
    if (!isEnd) {
      rafId.current = requestAnimationFrame(runScaleAni);
    }
  };

  function runNextScale(scaleDiff: number) {
    const nextTargetScale = Math.max(1, Math.min(maxScale, targetScale.current + scaleDiff));
    if (targetScale.current === nextTargetScale) return;

    targetScale.current = nextTargetScale;
    scaleAniDuration.current = (1000 * Math.sqrt(Math.abs(targetScale.current - currenScale.current))) / 4;
    startScale.current = currenScale.current;
    els.current = performance.now();
    if (rafId.current > 0) cancelAnimationFrame(rafId.current);
    runScaleAni();
  }

  useEffect(() => {
    const scaleDiff = (props.scrollY / document.documentElement.clientHeight) * maxScale;
    runNextScale(scaleDiff);

    return () => {
      if (rafId.current > 0) cancelAnimationFrame(rafId.current);
    };
  }, [props.scrollY]);

  function onWheel(e: WheelEvent) {
    if (e.deltaY >= 0 || props.scrollY > 0) return;

    const scaleDiff = (e.deltaY / scaleAniDuration.current) * maxScale;
    runNextScale(scaleDiff);
  }

  useLayoutEffect(() => {
    if (!videoRef.current) return;

    videoRef.current.style.setProperty('--mask-size', '80%');
    videoRef.current.style.setProperty('--mask-pos-y', '50%');
  }, []);

  return (
    <div
      className="astrark-home w-full h-screen flex justify-center items-center overflow-hidden absolute left-0 top-0 z-0"
      onWheel={(e) => onWheel(e as any)}
    >
      <div ref={videoRef} className="absolute left-0 top-0 w-full h-full z-0 ">
        <video
          className={'object-cover w-full h-full ' + styles.maskVideo}
          autoPlay
          playsInline
          muted
          loop
          preload="auto"
        >
          <source src="/video/astrark.mp4" />
        </video>

        <Image className="object-cover z-10" src={maskBg} alt="" fill />

        <div className={'absolute w-full h-1/2 left-0 bottom-0 z-20 ' + styles.videoShadow}></div>
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
