import Image from "next/image";
import moonBg from "img/loading/bg_moon.png";
import MediaIconBar from "../MediaIconBar";
import { useEffect, useRef, useState } from "react";

export default function Loading() {
  const textRef = useRef<HTMLSpanElement>(null);
  const [rafId, setRafId] = useState(-1);
  const [els, setEls] = useState(0);
  let textProgress = 100;

  function startTextAni(currentEl: number) {
    if (!textRef.current || textProgress <= 0) return;

    textProgress -= (currentEl - els) / 5000;
    textRef.current.style.backgroundPositionX = `${textProgress}%`;
    setRafId(requestAnimationFrame(startTextAni));
  }

  useEffect(() => {
    setEls(performance.now());
    setRafId(requestAnimationFrame(startTextAni));

    return () => { if (rafId > 0) cancelAnimationFrame(rafId) };
  }, []);

  return (
    <div className="loading fixed z-50 w-full h-screen flex justify-center items-center">
      <div className="moon w-[19.875rem] h-[34.5rem] absolute top-1/2 left-[36.67%] -translate-y-1/2">
        <Image
          className="object-contain"
          src={moonBg}
          alt=""
          fill
          priority
          sizes="100%"
        />
      </div>

      <div className="text-wrapper z-10">
        <span ref={textRef} className="text uppercase font-semakin text-4xl text-transparent bg-clip-text">
          Moonveil Entertainment presents.
        </span>
      </div>
      
      <MediaIconBar className="absolute left-1/2 bottom-12 -translate-x-1/2" />
    </div>
  );
}
