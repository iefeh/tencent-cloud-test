import Image from "next/image";
import moonBg from "img/loading/bg_moon.png";
import MediaIconBar from "../MediaIconBar";
import { useEffect, useRef, useState } from "react";
import Belt from "../Belt";

interface Props {
  resLoading?: boolean;
  onLoaded?: () => void;
}

export default function Loading(props: Props) {
  const textRef = useRef<HTMLSpanElement>(null);
  const [rafId, setRafId] = useState(-1);
  const progressRef = useRef<HTMLDivElement>(null);
  let els = 0;
  let textProgress = 100;

  function startTextAni(currentEl = els) {
    if (!textRef.current || !progressRef.current) return;
    if (textProgress <= 0) {
      props.onLoaded?.();
      return;
    }

    textProgress =
      100 - ((currentEl - els) * 16.6666) / (props.resLoading ? 5000 : 300);
    textRef.current.style.backgroundPositionX = `${textProgress}%`;
    const prog = Math.max(Math.min(100 - Math.ceil(textProgress), 100), 0);
    progressRef.current.innerText = `${prog}%`;
    setRafId(requestAnimationFrame(startTextAni));
  }

  useEffect(() => {
    els = performance.now();
    startTextAni();

    return () => {
      if (rafId > 0) cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    if (rafId > 0) cancelAnimationFrame(rafId);

    els = performance.now();
    startTextAni();
  }, [props.resLoading]);

  return (
    <div id="luxy" className="loading fixed z-50 w-full h-screen flex justify-center items-center">
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

      <div className="text-wrapper z-10 relative text-center">
        <span
          ref={textRef}
          className="text uppercase font-semakin text-4xl text-transparent bg-clip-text"
        >
          Moonveil Entertainment presents.
        </span>

        <Belt className="absolute left-1/2 -translate-x-1/2 top-[3.875rem] max-md:top-[8.4rem]" />

        <div
          ref={progressRef}
          className="progress absolute left-1/2 -translate-x-1/2 top-[6.125rem] font-semakin text-xl max-md:top-[10rem]"
        >
          0%
        </div>
      </div>

      <MediaIconBar className="absolute left-1/2 bottom-12 -translate-x-1/2" />
    </div>
  );
}
