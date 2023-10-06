import React from "react";
// import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "./components/home/Header";
import LineBorder from "./components/home/LineBorder/index";
import { Suspense } from "react";
import Loading from "./components/common/Loading";
import "swiper/css";
import 'swiper/css/pagination';

const inter = Inter({ subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "Moonveil",
//   description: "Moonveil Official Website",
// };

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <React.Fragment>
      <LineBorder />

      <main
        className="flex w-full h-screen flex-col items-center justify-between relative bg-black"
        id="main-layout"
      >
        <Suspense fallback={<Loading />}>
          <Header />

          <section className="page-container w-full h-full">{children}</section>
        </Suspense>
      </main>
    </React.Fragment>
  );
}
