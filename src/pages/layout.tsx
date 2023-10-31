import React from "react";
import Header from "./components/home/Header";
import LineBorder from "./components/home/LineBorder/index";
import { Suspense } from "react";
import Loading from "./components/common/Loading";
import "swiper/css";
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import 'swiper/css/navigation';

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <React.Fragment>
      <LineBorder />

      {/* <main
        className="flex w-full h-screen flex-col items-center justify-between relative bg-black"
        id="main-layout"
      > */}
        <Suspense fallback={<Loading />}>
          <Header />

          <main className="dark page-container w-full h-full">{children}</main>
        </Suspense>
      {/* </main> */}
    </React.Fragment>
  );
}
