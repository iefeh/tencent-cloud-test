"use client";

import { createRef, useEffect } from "react";
import BScroll from "@better-scroll/core";
import ScrollBar from "@better-scroll/scroll-bar";
import MouseWheel from "@better-scroll/mouse-wheel";
import AstrarkHome from "./components/home";
import AstrArkSchool from "./components/school";

BScroll.use(MouseWheel);
BScroll.use(ScrollBar);

export default function Home() {
  const scrollWrapper = createRef<HTMLDivElement>();

  useEffect(() => {
    const bs = new BScroll(scrollWrapper.current!, {
      scrollY: true,
      bounce: false,
      mouseWheel: true,
    });
  });

  return (
    <section
      ref={scrollWrapper}
      className="scroll-wrapper w-full h-screen flex flex-col items-center justify-between overflow-hidden"
    >
      <div className="scroll-container w-full relative">
        <AstrarkHome />

        <AstrArkSchool />
      </div>
    </section>
  );
}
