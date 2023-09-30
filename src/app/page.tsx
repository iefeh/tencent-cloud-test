"use client";

import SwiperScreen from "./components/home/SwiperScreen";

export default function Home() {
  return (
    <section className=" flex flex-col items-center justify-between">
      <div className="scroll-wrapper w-full h-full relative">
        <SwiperScreen />
      </div>
    </section>
  );
}
