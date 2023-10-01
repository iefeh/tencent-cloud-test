import { createRef, useLayoutEffect, useState } from "react";
import Image from "next/image";
import "./index.scss";
import SchoolIcons from "../school/SchoolIcons";
import gBG from "img/astrark/school/bg_genetic.jpg";
import mBG from "img/astrark/school/bg_mechanoid.jpg";
import sBG from "img/astrark/school/bg_spiritual.jpg";
import nBG from "img/astrark/school/bg_natural.jpg";

export default function SchoolDesc() {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const canvasRef = createRef<HTMLCanvasElement>();
  const [activeIndex, setActiveIndex] = useState(0);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D>();

  const swipers = [
    {
      name: "genetic",
      homeplanet: "zenith",
      bg: gBG,
    },
    {
      name: "mechanoid",
      homeplanet: "hyperborea",
      bg: mBG,
    },
    {
      name: "spiritual",
      homeplanet: "aoen",
      bg: sBG,
    },
    {
      name: "natural",
      homeplanet: "aurora",
      bg: nBG,
    },
  ];

  function renderImage() {
    if (!canvasRef.current || !ctx) return;

    const bg = swipers[activeIndex].bg;

    const img = new window.Image();
    img.src = bg.src;

    img.onload = function () {
      const { width: w, height: h } = img;
      
      canvasRef.current!.width = w;
      canvasRef.current!.height = h;
      canvasRef.current!.style.width = w + 'px';
      canvasRef.current!.style.height = h + 'px';

      ctx!.clearRect(0, 0, width, height);
      ctx!.drawImage(img, 0, 0, w, h);
    };
  }

  function setSize() {
    setWidth(window.innerWidth);
    setHeight(window.innerHeight);
  }

  useLayoutEffect(() => {
    setSize();

    window.addEventListener("resize", setSize);
  }, []);

  useLayoutEffect(() => {
    setCtx(canvasRef.current!.getContext("2d")!);
  }, [canvasRef]);

  useLayoutEffect(() => {
    if (!ctx) return;

    renderImage();
  }, [ctx]);

  useLayoutEffect(() => {
    renderImage();
  }, [activeIndex]);

  return (
    <section className="school-desc w-full h-screen relative overflow-hidden">
      <canvas ref={canvasRef} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"></canvas>

      <div className="school w-full h-screen absolute left-0 top-0 z-10">
        <div className="desc uppercase absolute w-[29.3125rem] h-[15rem] left-[18.75%] top-[27.25%] border-[#F4C699] border-l-[3px] px-[2.625rem] py-[2.625rem] box-border">
          <div className="flex items-center">
            <div className="w-[3.875rem] h-[3.875rem] relative">
              <Image
                className="object-cover"
                src={`/img/astrark/school/${swipers[activeIndex].name}.png`}
                alt=""
                fill
              />
            </div>

            <div className="h-12 uppercase text-5xl font-semakin ml-[0.625rem]">
              {swipers[activeIndex].name}
            </div>
          </div>

          <div className="font-semakin text-2xl text-basic-yellow mt-3">
            Home Planet : {swipers[activeIndex].homeplanet}
          </div>
        </div>
      </div>

      <SchoolIcons
        className="absolute left-1/2 bottom-12 -translate-x-1/2"
        activeIndex={activeIndex}
        onClick={(index) => setActiveIndex(index)}
      />
    </section>
  );
}
