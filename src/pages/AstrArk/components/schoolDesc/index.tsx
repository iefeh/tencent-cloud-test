import { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import SchoolIcons from "../school/SchoolIcons";
import gBG from "img/astrark/school/bg_genetic.jpg";
import mBG from "img/astrark/school/bg_mechanoid.jpg";
import sBG from "img/astrark/school/bg_spiritual.jpg";
import nBG from "img/astrark/school/bg_natural.jpg";
import { Sketch } from "@/hooks/sketch";

export default function SchoolDesc() {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const bgContainerRef = useRef<HTMLDivElement>(null);
  const sketch = useRef<Sketch>();

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

  function initSketch() {
    if (!bgContainerRef.current) return;

    sketch.current = new Sketch(
      bgContainerRef.current,
      [gBG.src, mBG.src, sBG.src, nBG.src],
      width,
      height,
      {
        // debug: true,
        uniforms: {
          intensity: { value: 0.3, type: "f", min: 0, max: 2 },
        },
        fragment: `
          uniform float time;
          uniform float progress;
          uniform float width;
          uniform float scaleX;
          uniform float scaleY;
          uniform float transition;
          uniform float radius;
          uniform float intensity;
          uniform sampler2D texture1;
          uniform sampler2D texture2;
          uniform sampler2D displacement;
          uniform vec4 resolution;
          varying vec2 vUv;

          void main()	{
            vec2 newUV = (vUv - vec2(0.5))*resolution.zw + vec2(0.5);

              vec4 d1 = texture2D(texture1, newUV);
              vec4 d2 = texture2D(texture2, newUV);

              float displace1 = (d1.r + d1.g + d1.b)*0.33;
              float displace2 = (d2.r + d2.g + d2.b)*0.33;
              
              vec4 t1 = texture2D(texture1, vec2(newUV.x + progress * (displace2 * intensity), newUV.y));
              vec4 t2 = texture2D(texture2, vec2(newUV.x + (1.0 - progress) * (displace1 * intensity), newUV.y));

              gl_FragColor = mix(t1, t2, progress);

          }

        `,
      }
    );
  }

  function setSize() {
    setWidth(window.innerWidth);
    setHeight(window.innerHeight);
  }

  function onIconClick(index: number) {
    if (index === activeIndex || sketch.current?.isRunning) return;
    setActiveIndex(index);
    sketch.current?.jumpTo(index);
  }

  useLayoutEffect(() => {
    setSize();

    window.addEventListener("resize", setSize);
    return () => window.removeEventListener("resize", setSize);
  }, []);

  useLayoutEffect(() => {
    if (sketch.current) return;

    initSketch();
  }, []);

  return (
    <section className="school-desc w-full h-screen relative overflow-hidden">
      <div ref={bgContainerRef} className="w-full h-full"></div>

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
        onClick={onIconClick}
      />
    </section>
  );
}
