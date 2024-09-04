import S3Image from '@/components/common/medias/S3Image';
import Landscape from '@/components/common/screen/Landscape';
import AstrArkLayout from '@/components/layouts/AstrArkLayout';
import CateTabs from '@/components/pages/astrark/shop/CateTabs';
import ShopHeader from '@/components/pages/astrark/shop/ShopHeader';
import { observer } from 'mobx-react-lite';
import { NextPage } from 'next';

const DeleteAccountPage: NextPage & BasePage = () => {
  return (
    <Landscape>
      <section className="w-screen h-screen flex flex-col relative">
        <S3Image className="object-cover" src="/astrark/shop/bg.png" fill />

        <ShopHeader />

        <CateTabs />
      </section>
    </Landscape>
  );
};

DeleteAccountPage.getLayout = AstrArkLayout;

export default observer(DeleteAccountPage);
