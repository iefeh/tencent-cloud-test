import { useRef, useEffect } from 'react';

export default function IndexScreen() {
  const rafId = useRef(0);

  function runAni() {
    if (!window.luxy) return;
    requestAnimationFrame(runAni);
    const y = window.luxy.getWrapperTranslateY();
    const sy = document.documentElement.scrollTop || document.body.scrollTop;
    const h = document.documentElement.clientHeight;
    if (y < h && sy > h && h - y > 2) {
      document.documentElement.scrollTo(0, h);
    }
  }

  useEffect(() => {
    if (rafId.current > 0) cancelAnimationFrame(rafId.current);
    runAni();

    return () => {
      if (rafId.current > 0) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <div className="page-tetra-nft-index-screen w-full">
      <div className="w-full h-screen relative flex justify-center items-center"></div>

      <div className="w-full h-screen flex justify-center items-center">
        <div className="w-[48.1875rem] font-decima text-lg text-justify">
          <div>
            Introducing the TETRA NFT Series, the groundbreaking and strategic ecosystem NFTs by Moonveil. The
            first-ever release promises to be the most valuable and sought-after NFT product in the future. Our unique mechanics around collecting, synthesizing, and upgrading NFTs will grant you exclusive ownership privileges and rewards.
          </div>
          <br />
          <div className="mt-5">
            Owning a TETRA NFT places you at the heart of Moonveil&apos;s evolving ecosystem. We&apos;ve carefully crafted a broad spectrum of benefits across our in-game and platform offerings, aimed at providing you with consistent, long-term returns. Seize this exciting chance to be a part of the future of gaming and NFTs, all while reaping enduring rewards through Moonveil&apos;s  unique TETRA NFTs.
          </div>
        </div>
      </div>
    </div>
  );
}
