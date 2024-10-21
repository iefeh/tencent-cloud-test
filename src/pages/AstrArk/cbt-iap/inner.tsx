import S3Image from '@/components/common/medias/S3Image';
import AstrArkLayout from '@/components/layouts/AstrArkLayout';
import CbtIapInnerHeader from '@/components/pages/astrark/cbt-iap/InnerHeader';
import MainContent from '@/components/pages/astrark/cbt-iap/home/MainContent';
import useToken from '@/hooks/pages/astrark/useToken';
import { NextPage } from 'next';

const CbtIapPage: NextPage & BasePage = () => {
  useToken();

  return (
    <section className="w-screen h-screen relative flex items-center">
      <S3Image className="object-cover" src="/astrark/cbt-iap/bg.png" fill />

      <CbtIapInnerHeader className="!absolute left-0 top-8 w-full" />

      <MainContent />
    </section>
  );
};

CbtIapPage.getLayout = AstrArkLayout;

export default CbtIapPage;
