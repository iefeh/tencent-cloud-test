"use client";

import YellowCircle from "./components/common/YellowCircle";
import SwiperScreen from "./components/home/SwiperScreen";

export default function Home() {
  return (
    <section className=" flex flex-col items-center justify-between">
      <div className="scroll-wrapper w-full h-full relative">
        <SwiperScreen />

        <YellowCircle className="absolute right-[4.375rem] bottom-20 z-10" />
      </div>
    </section>
  );
}
