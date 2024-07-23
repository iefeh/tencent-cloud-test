import DetailTabs from '@/components/pages/minigames/details/DetailTabs';
import FloatFooter from '@/components/pages/minigames/details/FloatFooter';
import TopBanner from '@/components/pages/minigames/details/TopBanner';
import Head from 'next/head';
import { FC } from 'react';

const MiniGameDetailsPage: FC & BasePage = () => {
  return (
    <section className="relative flex flex-col font-jcyt6">
      <Head>
        <link
          rel="preload"
          as="font"
          href="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/fonts/jiangchengyuanti600W.ttf"
          crossOrigin="anonymous"
        ></link>
        <link
          rel="preload"
          as="font"
          href="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/fonts/jiangchengyuanti400W.ttf"
          crossOrigin="anonymous"
        ></link>
      </Head>

      <TopBanner />

      <DetailTabs />

      <FloatFooter />
    </section>
  );
};

MiniGameDetailsPage.hasNavMask = true;

export default MiniGameDetailsPage;
