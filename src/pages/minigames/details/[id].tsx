import DetailTabs, { type DetailTabsRef } from '@/components/pages/minigames/details/DetailTabs';
import FloatFooter from '@/components/pages/minigames/details/FloatFooter';
import TopBanner from '@/components/pages/minigames/details/TopBanner';
import { MGDContext, useMGDStore } from '@/store/MiniGameDetails';
import Head from 'next/head';
import { useRef, type FC } from 'react';

const MiniGameDetailsPage: FC & BasePage = () => {
  const mgdStore = useMGDStore();
  const detailTabsRef = useRef<DetailTabsRef>(null);

  function onCompleteTasks() {
    detailTabsRef.current?.compelteTasks?.();
  }

  return (
    <MGDContext.Provider value={mgdStore}>
      <section className="relative flex flex-col font-jcyt6">
        <Head>
          <link
            rel="preload"
            as="font"
            href="https://d3dhz6pjw7pz9d.cloudfront.net/fonts/jiangchengyuanti600W.ttf"
            crossOrigin="anonymous"
          ></link>
          <link
            rel="preload"
            as="font"
            href="https://d3dhz6pjw7pz9d.cloudfront.net/fonts/jiangchengyuanti400W.ttf"
            crossOrigin="anonymous"
          ></link>
        </Head>

        <TopBanner />

        <DetailTabs ref={detailTabsRef} />

        <FloatFooter onCompleteTasks={onCompleteTasks} />
      </section>
    </MGDContext.Provider>
  );
};

MiniGameDetailsPage.hasNavMask = true;

export default MiniGameDetailsPage;
