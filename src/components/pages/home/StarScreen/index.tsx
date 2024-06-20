import { useEffect, useRef } from 'react';
import planetImg from 'img/home/planet.png';
import Image from 'next/image';
import { createPortal } from 'react-dom';
import Head from 'next/head';
import ShineBackground from '@/components/common/ShineBackground';

export default function StarScreen() {
  const planetRef = useRef<HTMLImageElement>(null);
  const rafId = useRef(0);

  function setLuxyTrans() {
    if (!planetRef.current || !window.luxy) return;

    const y = window.luxy.getWrapperTranslateY();
    const l = document.documentElement.clientHeight;
    const cur = (1.2 * l) / 960 - (y / l / 2 - 0.5) * 0.6;
    planetRef.current.style.setProperty('--scale', cur + '');
    rafId.current = requestAnimationFrame(setLuxyTrans);
  }

  function onLuxyScroll() {
    if (rafId.current > 0) cancelAnimationFrame(rafId.current);
    setLuxyTrans();
  }

  useEffect(() => {
    window.addEventListener('scroll', onLuxyScroll);
    return () => window.removeEventListener('scroll', onLuxyScroll);
  }, []);

  const StarContent = (
    <div className="star-screen z-0 fixed left-0 top-0 w-full h-screen pointer-events-none flex justify-center items-center">
      <Head>
        <link rel="preload" as="image" href="/img/home/planet.png" crossOrigin="anonymous"></link>
      </Head>

      <Image
        ref={planetRef}
        className="bg-img w-[80vw] h-[70vw] flex z-10 relative max-lg:top-0 -top-36 origin-center"
        src={planetImg}
        alt=""
        priority
        unoptimized
      />

      <ShineBackground count={50} />
    </div>
  );

  return createPortal(StarContent, document.body);
}
