"use client";

import { createRef, useEffect, useMemo, useRef, useLayoutEffect } from "react";
import BScroll from "@better-scroll/core";
import ScrollBar from "@better-scroll/scroll-bar";
import MouseWheel from "@better-scroll/mouse-wheel";
import AstrarkHome from "./components/home";
import AstrArkSchool from "./components/school";
import AstrArkSchoolDesc from "./components/schoolDesc";
import WorldView from "./components/worldView";
import SecondDesc from './components/secondDesc';

BScroll.use(MouseWheel);
BScroll.use(ScrollBar);

export default function Home() {
  const scrollWrapper = createRef<HTMLDivElement>();
  
  const bsRef = useRef<any>()

  useLayoutEffect(() => {
    bsRef.current = new BScroll(scrollWrapper.current!, {     
      mouseWheel: true,
      useTransition: true,
      scrollY: true,
      bounce: false,
      probeType: 3,
    })

    return () => {
      bsRef.current.destroy();
    }
  }, [])

  const disable = () => {
    bsRef.current.disable()
  }

  const enable = () => {
    bsRef.current.enable()
  }

  return (
    <section
      ref={scrollWrapper}
      className="scroll-wrapper w-full h-screen overflow-hidden"
    >
      <div className="scroll-container">
        <div className="w-full flex h-screen relative text-center items-center" onClick={disable}>
          <AstrarkHome toDisable={disable} toEnable={enable}/>
        </div>

        <SecondDesc />

        <div className="w-full h-screen">
          <WorldView />
        </div>

        <AstrArkSchool />

        <AstrArkSchoolDesc />
      </div>
    </section>
  );
}
