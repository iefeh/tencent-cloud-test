import DisplayAssets from '@/components/pages/astrark/assets/DisplayAssets';
import MyAssets from '@/components/pages/astrark/assets/MyAssets';
import useDisplayAssets from '@/hooks/pages/astrark/assets/useDisplayAssets';
import { observer } from 'mobx-react-lite';
import { NextPage } from 'next';
import Head from 'next/head';

const AssetsPage: NextPage & BasePage = () => {
  const { data, queryData, loading } = useDisplayAssets();
  const fonts = ['FZXinGHJW-DB.TTF', 'FZXinGHJW-SB.TTF', 'Poppins-Regular.ttf'];

  return (
    <section className="relative w-screen bg-[url('https://moonveil-public.s3.ap-southeast-2.amazonaws.com/astrark/assets/bg.png')] bg-top bg-contain bg-no-repeat flex flex-col items-center font-fzdb">
      <Head>
        {fonts.map((font, index) => (
          <link
            key={index}
            rel="preload"
            as="font"
            href={`https://moonveil-public.s3.ap-southeast-2.amazonaws.com/fonts/${font}`}
            crossOrigin="anonymous"
          ></link>
        ))}
      </Head>

      <DisplayAssets items={data} loading={loading} onUpdate={queryData} />

      <MyAssets displayItems={data} onUpdate={queryData} />

      <p className="text-lg leading-none text-white/30 mt-7 mb-12">Copyright 2024 Moonveil Entertainment. </p>
    </section>
  );
};

AssetsPage.getLayout = (page) => {
  return page;
};

export default observer(AssetsPage);
