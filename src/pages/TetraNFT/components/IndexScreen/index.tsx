import PageDesc from '@/pages/components/common/PageDesc';
import YellowCircle from '@/pages/components/common/YellowCircle';
import { useEffect, useRef } from 'react';

export default function IndexScreen() {
  const scrollY = useRef(0);
  const rafId = useRef(0);
  const titleOpacity = useRef(1);
  const descScreenRef = useRef<HTMLDivElement>(null);

  function runAni() {
    const y = window.luxy.getWrapperTranslateY();
    const duration = Math.max((1 - (y - 100) / 100) * 300, 0);
    const targetOpacity = Math.max(1 - (y - 100) / 100, 0);
    if (duration < Number.EPSILON) {
      titleOpacity.current = 0;
    } else {
      titleOpacity.current += ((targetOpacity - titleOpacity.current) / duration) * 16.6667;
    }

    if (descScreenRef.current) {
      descScreenRef.current.style.opacity = titleOpacity.current + '';
    }
    rafId.current = requestAnimationFrame(runAni);
  }

  function onLuxyScroll() {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const targetY = scrollTop;
    if (rafId.current > 0) cancelAnimationFrame(rafId.current);
    runAni();
    const screenHeight = document.documentElement.clientHeight;
    if (targetY > scrollY.current && targetY < screenHeight) {
      document.documentElement.scrollTo({ left: 0, top: screenHeight });
    } else if (targetY < scrollY.current && targetY < screenHeight) {
      document.documentElement.scrollTo({ left: 0, top: 0 });
    }
    scrollY.current = targetY;
  }

  useEffect(() => {
    window.addEventListener('scroll', onLuxyScroll);
    return () => window.removeEventListener('scroll', onLuxyScroll);
  }, []);

  return (
    <div className="w-full">
      <div ref={descScreenRef} className="w-full h-screen relative flex justify-center items-center">
        <PageDesc
          needAni
          title={
            <div className="font-semakin text-center">
              <div className="text-4xl">Introducing The</div>
              <div className="text-[6.25rem]">Tetra NFT Series</div>
            </div>
          }
        />

        <YellowCircle className="absolute right-[4.375rem] bottom-20 z-10 transition-opacity duration-500" />
      </div>

      <div className="w-full h-screen flex justify-center items-center">
        <div className="w-[48.1875rem] font-decima text-lg text-justify">
          <div>
            Introducing the Tetra NFT Series, the groundbreaking and strategic ecosystem NFTs by Moonveil. The
            first-ever release promises to be the most valuable and sought-after NFT product in the future. Our unique
            collecting, synthesizing, and upgrading NFT gameplay will grant you exclusive ownership privileges and
            rewards.
          </div>
          <br />
          <div className="mt-5">
            As a Tetra NFT holder, you become a vital part of Moonveil&apos;s future ecosystem. We&apos;ve meticulously
            designed a comprehensive system of benefits across multiple in-game and platform products, ensuring you
            receive long-term, stable returns. Embrace this thrilling opportunity to shape the future of gaming and NFTs
            while enjoying lasting rewards with Moonveil&apos;s extraordinary Tetra NFTs.
          </div>
        </div>
      </div>
    </div>
  );
}
