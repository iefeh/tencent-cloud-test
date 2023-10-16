import React, { useEffect, useLayoutEffect, useRef } from 'react';
import arrowImg from 'img/astrark/arrow.png';
import Image from 'next/image';
import styles from './index.module.css';
import maskBg from 'img/astrark/bg-mask.png';
import whiteLogoImg from 'img/logo_white.png';

interface Props {
  scrollY: number;
}

function easeOutQuad(t: number, b: number, c: number, d: number) {
  return -c * (t /= d) * (t - 2) + b;
}

const AstrarkHome: React.FC<Props> = (props) => {
  const { scrollY } = props;
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

  function runNextScale(nextTargetScale: number) {
    nextTargetScale = Math.max(1, Math.min(maxScale, nextTargetScale));
    if (targetScale.current === nextTargetScale && currenScale.current === targetScale.current) return;

    targetScale.current = nextTargetScale;
    scaleAniDuration.current = (1000 * Math.sqrt(Math.abs(targetScale.current - currenScale.current))) / 4;
    startScale.current = currenScale.current;
    els.current = performance.now();
    if (rafId.current > 0) cancelAnimationFrame(rafId.current);
    runScaleAni();
  }

  useEffect(() => {
    const nextTargetScale = (scrollY / document.documentElement.clientHeight) * maxScale * 1.4;
    runNextScale(nextTargetScale);

    return () => {
      if (rafId.current > 0) cancelAnimationFrame(rafId.current);
    };
  }, [scrollY]);

  useLayoutEffect(() => {
    if (!videoRef.current) return;

    videoRef.current.style.setProperty('--mask-size', '80%');
    videoRef.current.style.setProperty('--mask-pos-y', '50%');
  }, []);

  return (
    <div
      ref={videoRef}
      className={
        'w-full h-screen flex justify-center items-center overflow-hidden fixed left-0 top-0 z-0 ' + styles.astrarkHome
      }
    >
      <div className="absolute left-0 top-0 w-full h-full z-0 ">
        <video
          className={'object-cover w-full h-full ' + (currenScale.current < maxScale ? styles.maskVideo : '')}
          autoPlay
          playsInline
          muted
          loop
          preload="auto"
        >
          <source src="/video/astrark.mp4" />
        </video>

        <Image
          className={['object-cover z-10', styles.maskBg, scrollY > 0 ? styles.hideMaskBg : ''].join(' ')}
          src={maskBg}
          alt=""
          fill
        />

        <div className={'absolute w-full h-1/2 left-0 bottom-0 z-20 ' + styles.videoShadow}></div>
      </div>

      <Image
        className={
          'w-[3.1875rem] h-[1.75rem] absolute left-1/2 -translate-x-1/2 bottom-[4.5625rem] z-20 ' + styles.arrowImg
        }
        src={arrowImg}
        alt=""
      />

      <Image
        className={`w-56 h-[13.375rem] absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 transition-opacity ease-in-out duration-[1000ms] opacity-0 ${
          currenScale.current < maxScale - 8 ? '' : 'opacity-100'
        }`}
        src={whiteLogoImg}
        alt=""
      />
    </div>
  );
};

export default AstrarkHome;
