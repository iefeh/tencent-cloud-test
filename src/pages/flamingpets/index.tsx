import Head from 'next/head';
import { FC, useState, CSSProperties } from 'react';
import gyozaComp from "@/components/pages/gyoza"

const { GyozaHome, GuidePage } = gyozaComp;

const GyozaPage: FC & BasePage = () => {
  const [showMask, setShowMask] = useState(true)

  return (
    <section className="font-jcyt6 w-screen h-screen">
      <Head>
        <link
          rel="preload"
          as="font"
          href="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/fonts/jiangchengyuanti600W.ttf"
          crossOrigin="anonymous"
        ></link>
      </Head>

      <GyozaHome showMask={showMask}>
        <GuidePage
          setShowMask={setShowMask}
        ></GuidePage>
      </GyozaHome>
    </section>
  );
};

GyozaPage.hasNavMask = true;

export default GyozaPage;
