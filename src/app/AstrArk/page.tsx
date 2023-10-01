"use client";

import { createRef, useEffect } from "react";
import BScroll from "@better-scroll/core";
import ScrollBar from "@better-scroll/scroll-bar";
import MouseWheel from "@better-scroll/mouse-wheel";
import AstrarkHome from "./components/home";
import AstrArkSchool from "./components/school";
import AstrArkSchoolDesc from "./components/schoolDesc";
import WorldView from "./components/worldView";

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
      className="scroll-wrapper w-full h-screen overflow-hidden"
    >
      <div className="scroll-container">
        <div className="w-full flex h-screen relative text-center items-center">
          <AstrarkHome />
        </div>

        <div className="w-full h-screen relative flex justify-center items-center overflow-hidden">
          <WorldView />
        </div>

        <AstrArkSchool />

        <AstrArkSchoolDesc />
      </div>
    </section>
  );
}
