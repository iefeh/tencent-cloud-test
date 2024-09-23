import S3Image from '@/components/common/medias/S3Image';
import Landscape from '@/components/common/screen/Landscape';
import AstrArkLayout from '@/components/layouts/AstrArkLayout';
import CateTabs from '@/components/pages/astrark/shop/CateTabs';
import AuthNoticeModal from '@/components/pages/astrark/shop/Modal/AuthNoticeModal';
import ShopHeader from '@/components/pages/astrark/shop/ShopHeader';
import useToken from '@/hooks/pages/astrark/useToken';
import { observer } from 'mobx-react-lite';
import { NextPage } from 'next';

const DeleteAccountPage: NextPage & BasePage = () => {
  const { authDisclosure } = useToken();

  return (
    <Landscape className="font-fzdb">
      <section className="w-screen h-screen flex flex-col gap-y-6 relative font-fzdb">
        <S3Image className="object-cover" src="/astrark/shop/bg.png" fill />

        <ShopHeader />

        <CateTabs />

        <AuthNoticeModal disclosure={authDisclosure} />
      </section>
    </Landscape>
  );
};

DeleteAccountPage.getLayout = AstrArkLayout;

export default observer(DeleteAccountPage);
