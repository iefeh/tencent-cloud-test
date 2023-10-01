import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "./components/home/Header";
import LineBorder from "./components/home/LineBorder/index";
import { Suspense } from "react";
import Loading from "./components/common/Loading";
import './globals.scss';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Moonveil",
  description: "Moonveil Official Website",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className="sm:text-fz-12 md:text-fz-14 2xl:text-fz-16" lang="en">
      <head>
        <link rel="icon" href="./favicon.ico" sizes="any" />
      </head>
      <body className={inter.className}>
        <LineBorder />
        <main className="flex w-full h-screen flex-col items-center justify-between relative">
          <Suspense fallback={<Loading />}>
            <Header />

            <section className="page-container w-full h-full">
              {children}
            </section>

            <section className="page-container-mask fixed z-10"></section>
          </Suspense>
        </main>
      </body>
    </html>
  );
}
