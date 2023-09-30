"use client";

import SwiperScreen from "./components/home/SwiperScreen";
import Character from "./components/character/character";

export default function Home() {
  return (
    <>
      <section className=" flex flex-col items-center justify-between">
        <div className="scroll-wrapper w-full h-full">
          <SwiperScreen />
        </div>
        
        <div className="flex h-[56vw] justify-between bg-black relative overflow-hidden" >
          <Character />
        </div>
      </section>
    </>
  );
}
