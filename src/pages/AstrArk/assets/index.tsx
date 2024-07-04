import DisplayAssets from '@/components/pages/astrark/assets/DisplayAssets';
import MyAssets from '@/components/pages/astrark/assets/MyAssets';
import useDisplayAssets from '@/hooks/pages/astrark/assets/useDisplayAssets';
import { observer } from 'mobx-react-lite';
import { NextPage } from 'next';

const AssetsPage: NextPage & BasePage = () => {
  const { data, queryData } = useDisplayAssets();

  return (
    <section className="relative w-screen bg-[url('https://moonveil-public.s3.ap-southeast-2.amazonaws.com/astrark/assets/bg.png')] bg-top bg-contain bg-no-repeat h-[300vh] flex flex-col items-center">
      <DisplayAssets items={data} onUpdate={queryData} />

      <MyAssets displayItems={data} onUpdate={queryData} />
    </section>
  );
};

AssetsPage.getLayout = (page) => {
  return page;
};

export default observer(AssetsPage);
