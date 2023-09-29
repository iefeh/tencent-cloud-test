import "./globals.scss";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "./components/Header";

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
    <html lang="en">
      <head>
        <link rel="icon" href="./favicon.ico" sizes="any" />
      </head>
      <body className={inter.className}>
        <main className="flex w-full h-screen flex-col items-center justify-between relative">
          <Header />

          <section className="page-container w-full h-full">{children}</section>

          <section className="page-container-mask fixed z-10"></section>
        </main>
      </body>
    </html>
  );
}
