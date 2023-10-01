"use client";

import { createRef, useEffect, useState } from "react";
import BScroll from "@better-scroll/core";
import ScrollBar from "@better-scroll/scroll-bar";
import MouseWheel from "@better-scroll/mouse-wheel";

import SloganScreen from "./components/home/SloganScreen";
import SwiperScreen from "./components/home/SwiperScreen";
import Character from "./components/character/character";
import Footer from "./components/home/Footer";
import { BScrollConstructor } from "@better-scroll/core/dist/types/BScroll";

BScroll.use(MouseWheel);
BScroll.use(ScrollBar);

export default function Home() {
  const scrollWrapper = createRef<HTMLDivElement>();
  const [bs, setBS] = useState<BScrollConstructor>();
  const [sloganFixed, setSloganFixed] = useState(false);

  useEffect(() => {
    if (bs) return;

    const bscroll = new BScroll(scrollWrapper.current!, {
      scrollY: true,
      bounce: false,
      mouseWheel: true,
      probeType: 3,
    })
    setBS(bscroll);

    bscroll.on("scroll", ({ y }: { y: number }) => {
      const screenHeight = window.innerHeight;

      // TODO 高度判断
      if (-y >= screenHeight && -y <= screenHeight * 2) {
        setSloganFixed(true);
      } else {
        setSloganFixed(false);
      }
    });
  }, []);

  function onCanvasInited() {
    bs?.refresh();
  }

  return (
    <section
      ref={scrollWrapper}
      className="scroll-wrapper w-full h-screen flex flex-col items-center justify-between overflow-hidden"
    >
      <div className="scroll-container w-full relative">
        <SwiperScreen />

        <SloganScreen fixed={sloganFixed} onCanvasInited={onCanvasInited} />

        <div className="flex h-[56vw] justify-between bg-black relative overflow-hidden">
          <Character />
        </div>

        <Footer />
      </div>
    </section>
  );
}
