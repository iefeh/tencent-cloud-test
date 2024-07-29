import GameTabs from '@/components/pages/minigames/home/GameTabs';
import GameCollection from '@/components/pages/minigames/home/GameTabs/GameCollection';
import Head from 'next/head';
import { CSSProperties, FC, useState } from 'react';

const MiniGamesPage: FC & BasePage = () => {
  const [selectedKey, setSelectedKey] = useState('');

  return (
    <section className="relative flex flex-col items-center font-jcyt6 w-screen text-brown">
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

      <p
        className="pt-[68.1875rem] pb-[5.0625rem] stroke-content relative text-5xl text-center z-10 w-full bg-[url('https://moonveil-public.s3.ap-southeast-2.amazonaws.com/minigames/home/bg_banner.png')] bg-[length:100%_auto] bg-no-repeat text-white"
        style={{ '--stroke-color': '#403930', '--stroke-width': '3px' } as CSSProperties}
      >
        Moonveil Mini Games
      </p>

      <GameTabs
        className="absolute z-20 top-[73.125rem] left-1/2 -translate-x-1/2"
        value={selectedKey}
        onSelectionChange={setSelectedKey}
      />

      <div className="bg-[url('https://moonveil-public.s3.ap-southeast-2.amazonaws.com/minigames/home/bg.png')] bg-[length:100%_auto] w-full flex flex-col items-center -mt-12 pt-[4.875rem] pb-[10.25rem]">
        <GameCollection type={selectedKey} />
      </div>
    </section>
  );
};

MiniGamesPage.hasNavMask = true;

export default MiniGamesPage;
