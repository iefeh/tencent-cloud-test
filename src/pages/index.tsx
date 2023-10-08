"use client";

import { createRef, useEffect, useState } from "react";
import BScroll from "@better-scroll/core";
import ScrollBar from "@better-scroll/scroll-bar";
import MouseWheel from "@better-scroll/mouse-wheel";
import SwiperScreen from "./components/home/SwiperScreen";
import Character from "./components/character/character";
import Footer from "./components/home/Footer";
import { BScrollConstructor } from "@better-scroll/core/dist/types/BScroll";
import StarScreen from "./components/home/StarScreen";
import PageDesc from "./components/common/PageDesc";

BScroll.use(MouseWheel);
BScroll.use(ScrollBar);

const enum AniState {
  VIDEO,
  SLOGAN,
  SLOGAN_TO_DESC,
  DESC,
  DESC_TO_CHARACTER,
  CHARACTER,
  CHARACTER_TO_CONTACT,
  CONTACT,
  CONTACT_TO_CHARACTER,
  CHARACTER_TO_DESC,
  DESC_TO_SLOGAN,
  SLOGAN_TO_VIDEO,
  SLOGAN_FROM_DESC,
}

export default function Home() {
  const scrollWrapper = createRef<HTMLDivElement>();
  const [bs, setBS] = useState<BScrollConstructor>();
  const basePageScrollTime = 200;
  const [aniState, setAniState] = useState(AniState.VIDEO);
  const [sloganTitleState, setSloganTitleState] = useState(0);
  const [starScreenClass, setStarScreenClass] = useState("");

  useEffect(() => {
    if (bs) return;

    const bscroll = new BScroll(scrollWrapper.current!, {
      scrollY: true,
      bounce: false,
      useTransition: false,
      probeType: 3,
    });
    setBS(bscroll);

    return () => bscroll.destroy();
  }, []);

  function onMaskAniEnd() {
    bs?.scrollTo(0, -window.innerHeight, 0);
    setAniState(AniState.SLOGAN);
    setSloganTitleState(1);
  }

  function onSloganScreenWheel(e: WheelEvent) {
    if (e.deltaY === 0) return;
    const isUp = e.deltaY < 0;
    bs?.scrollTo(
      0,
      e.deltaY < 0 ? 0 : -window.innerHeight * 2,
      isUp ? basePageScrollTime : 1200
    );
    setAniState(isUp ? AniState.SLOGAN_TO_VIDEO : AniState.SLOGAN_TO_DESC);

    function endCallback() {
      setAniState(isUp ? AniState.VIDEO : AniState.DESC);
      isUp && setSloganTitleState(0);
      bs!.off("scrollEnd", endCallback);
    }

    bs!.on("scrollEnd", endCallback);
  }

  function onSloganTitleAniEnd() {
    setSloganTitleState(2);
  }

  function onSloganDescScreenWheel(e: WheelEvent) {
    if (e.deltaY === 0) return;
    const isUp = e.deltaY < 0;
    bs?.scrollTo(
      0,
      (e.deltaY < 0 ? 1 : 3) * -window.innerHeight,
      isUp ? 1200 : basePageScrollTime
    );
    setAniState(isUp ? AniState.DESC_TO_SLOGAN : AniState.DESC_TO_CHARACTER);

    function endCallback() {
      setAniState(isUp ? AniState.SLOGAN_FROM_DESC : AniState.CHARACTER);
      bs!.off("scrollEnd", endCallback);
    }

    bs!.on("scrollEnd", endCallback);
  }

  function onCharacterWheel(e: WheelEvent) {
    if (e.deltaY === 0) return;
    const isUp = e.deltaY < 0;
    bs?.scrollTo(
      0,
      e.deltaY < 0
        ? -window.innerHeight * (aniState === AniState.CONTACT ? 3 : 2)
        : bs.maxScrollY,
      basePageScrollTime
    );
    setAniState(
      isUp
        ? aniState === AniState.CONTACT
          ? AniState.CHARACTER
          : AniState.CHARACTER_TO_DESC
        : AniState.CHARACTER_TO_CONTACT
    );

    function endCallback() {
      setAniState(isUp ? AniState.DESC : AniState.CONTACT);
      bs!.off("scrollEnd", endCallback);
    }

    bs!.on("scrollEnd", endCallback);
  }

  function onFooter(e: WheelEvent) {
    if (e.deltaY >= 0) return;
    bs?.scrollTo(0, -window.innerHeight * 3, basePageScrollTime);
    setAniState(AniState.CONTACT_TO_CHARACTER);

    function endCallback() {
      setAniState(AniState.CHARACTER);
      bs!.off("scrollEnd", endCallback);
    }

    bs!.on("scrollEnd", endCallback);
  }

  useEffect(() => {
    const className = [
      [
        AniState.SLOGAN,
        AniState.SLOGAN_TO_DESC,
        AniState.DESC,
        AniState.DESC_TO_SLOGAN,
        AniState.SLOGAN_FROM_DESC,
      ].includes(aniState) && "star-screen-ani",
      [AniState.SLOGAN, AniState.SLOGAN_TO_DESC].includes(aniState) &&
        "star-screen-planet-ani",
      [AniState.SLOGAN_TO_DESC, AniState.DESC].includes(aniState) &&
        "star-screen-to-desc-ani",
      [
        AniState.DESC_TO_SLOGAN,
        AniState.SLOGAN_FROM_DESC,
        AniState.DESC_TO_CHARACTER,
        AniState.CHARACTER,
      ].includes(aniState) && "star-screen-to-slogan-ani",
    ]
      .filter((c) => !!c)
      .join(" ");
    setStarScreenClass(className);
  }, [aniState]);

  return (
    <section
      ref={scrollWrapper}
      className="scroll-wrapper relative w-full h-screen flex flex-col items-center justify-between overflow-hidden bg-no-repeat bg-fixed bg-origin-border"
    >
      <div className="scroll-container w-full relative flex flex-col z-10">
        <SwiperScreen onMaskAniEnd={onMaskAniEnd} />

        <div
          className="slogan-screen w-full h-screen relative overflow-hidden "
          onWheel={(e) => onSloganScreenWheel(e as any)}
        >
          <div
            className={
              "title uppercase font-semakin text-[6.25rem] absolute left-1/2 top-0 -translate-x-1/2 z-20 whitespace-nowrap " +
              (sloganTitleState === 1
                ? "title-ani-start"
                : sloganTitleState === 2
                ? "title-ani-end"
                : "")
            }
            style={{
              animation:
                [AniState.SLOGAN, AniState.SLOGAN_FROM_DESC].includes(
                  aniState
                ) && sloganTitleState !== 2
                  ? `title_ani 0.5s linear`
                  : "none",
            }}
            onAnimationEnd={onSloganTitleAniEnd}
          >
            own your destiny
          </div>
        </div>

        <div
          className="w-full h-screen relative overflow-hidden"
          onWheel={(e) => onSloganDescScreenWheel(e as any)}
        >
          <div className="absolute left-[56.35%] top-[43.7%]">
            <PageDesc
              className="items-start text-left"
              hasBelt
              subtitle="With the power of cutting-edge technologies, our mission is to craft<br />top-notch gaming experiences that seamlessly<br /><span style='color: #f6c799'>combine casual flexibility</span> with <span style='color: #f6c799'>authentic fun depth.</span>"
              buttonLabel="about moonveil"
              buttonLink="/About"
            />
          </div>
        </div>

        <div
          className="overflow-hidden"
          onWheel={(e) => onCharacterWheel(e as any)}
        >
          <Character />
        </div>

        <Footer onWheel={(e) => onFooter(e as any)} />
      </div>

      <StarScreen className={starScreenClass} />
    </section>
  );
}
