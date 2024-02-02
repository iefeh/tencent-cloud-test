import Image from 'next/image';
import fogImg from 'img/bushwhack/fog/fog.jpg';
import leftFogImg from 'img/bushwhack/content/fog_left.png';
import rightFogImg from 'img/bushwhack/content/fog_right.png';
import CircularLoading from '@/pages/components/common/CircularLoading';
import FogMainContent from './components/FogMainContent';
import { useEffect, useRef, useState } from 'react';

export default function SuperFogScreen() {
  const [loading, setLoading] = useState(false);
  const rafId = useRef(0);

  function loop() {
    let isPositioned = false;
    try {
      const y = window.luxy.getWrapperTranslateY();
      isPositioned = y === window.innerHeight;
    } catch (error) {
      isPositioned = false;
    }

    setLoading(!isPositioned);

    rafId.current = requestAnimationFrame(loop);
  }

  useEffect(() => {
    loop();

    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  return (
    <div className="w-screen h-screen relative select-none flex justify-center items-center">
      {loading ? <Image className="pointer-events-none z-20" src={fogImg} alt="" fill /> : <FogMainContent />}

      <div
        className="absolute top-0 left-0 -translate-y-full rotate-180 w-full h-24 z-30 overflow-hidden pointer-events-none"
        style={{ mask: 'linear-gradient(to bottom, #000 0, rgba(0,0,0,0.3) 50%, transparent 100%)' }}
      >
        <Image className="w-full h-auto" src={fogImg} alt="" />
      </div>

      <Image
        className="w-[57.875rem] h-[50rem] object-cover absolute left-0 -top-[17rem] z-40 pointer-events-none"
        src={leftFogImg}
        alt=""
      />

      <Image
        className="w-[68.125rem] h-[50rem] object-cover absolute right-0 -top-[26.5625rem] z-40 pointer-events-none"
        src={rightFogImg}
        alt=""
      />

      <div className="absolute inset-0 z-40 overflow-hidden pointer-events-none">
        <div
          className="absolute bottom-0 left-0 translate-y-full rotate-180 w-full h-24 z-30 overflow-hidden pointer-events-none"
          style={{ mask: 'linear-gradient(to top, rgba(0,0,0,0.9) 0, rgba(0,0,0,0.3) 50%, transparent 100%)' }}
        >
          <Image className="w-full h-auto relative bottom-0" src={fogImg} alt="" />
        </div>

        <Image
          className="w-[57.875rem] h-[50rem] object-cover absolute left-0 -bottom-[33rem] z-40 pointer-events-none"
          src={leftFogImg}
          alt=""
        />

        <Image
          className="w-[68.125rem] h-[50rem] object-cover absolute right-0 -bottom-[23.4375rem] z-40 pointer-events-none"
          src={rightFogImg}
          alt=""
        />
      </div>

      {loading && <CircularLoading noBlur />}
    </div>
  );
}
