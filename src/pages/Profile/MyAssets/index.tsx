import Head from 'next/head';
import AutoBreadcrumbs from '@/pages/components/common/AutoBreadcrumbs';
import { useState } from 'react';
import MyAssets from '@/components/profile/assets/MyAssets';

export default function ProfilePage() {
  const [total, setTotal] = useState(0);

  return (
    <section
      id="luxy"
      className="w-full flex flex-col px-8 lg:px-[16.25rem] pt-[12.5rem] pb-[16rem] mx-auto min-h-screen bg-[url('/img/profile/bg.png')] bg-[length:100%_auto] bg-no-repeat"
    >
      <Head>
        <title>User Center | Moonveil Entertainment</title>
      </Head>

      <AutoBreadcrumbs hrefs={['/Profile']} />

      <div className="mt-12">
        <div className="font-semakin text-basic-yellow text-2xl">Display</div>
      </div>

      <div className="mt-12">
        <div className="font-semakin text-basic-yellow text-2xl">My Asset ( {total} )</div>

        <MyAssets />
      </div>
    </section>
  );
}
