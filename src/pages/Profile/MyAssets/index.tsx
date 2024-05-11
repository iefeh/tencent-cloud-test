import Head from 'next/head';
import AutoBreadcrumbs from '@/pages/components/common/AutoBreadcrumbs';
import MyAssets from '@/components/profile/assets/MyAssets';
import DisplayAssets from '@/components/profile/assets/DisplayAssets';
import useDisplayAssets from '@/hooks/pages/profile/assets/useDisplayAssets';

export default function ProfilePage() {
  const { loading, data, queryData } = useDisplayAssets();

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

        <DisplayAssets items={data} loading={loading} onUpdate={queryData} />
      </div>

      <div className="mt-[4.5rem]">
        <MyAssets displayItems={data} onUpdate={queryData} />
      </div>
    </section>
  );
}
