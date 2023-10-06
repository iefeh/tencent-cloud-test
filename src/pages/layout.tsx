import React from "react";
// import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "./components/home/Header";
import LineBorder from "./components/home/LineBorder/index";
import { Suspense } from "react";
import Loading from "./components/common/Loading";
import "swiper/css";

const inter = Inter({ subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "Moonveil",
//   description: "Moonveil Official Website",
// };

export default function RootLayout({
  children,
  loading
}: {
  children: React.ReactNode;
  loading: boolean;
}) {
  return (
    <React.Fragment>
      {loading || <LineBorder />}

      <main
        className="flex w-full h-screen flex-col items-center justify-between relative bg-black"
        id="main-layout"
      >
        <Suspense fallback={<Loading />}>
          {loading || <Header />}

          <section className="page-container w-full h-full">{children}</section>
        </Suspense>
      </main>
    </React.Fragment>
  );
}
