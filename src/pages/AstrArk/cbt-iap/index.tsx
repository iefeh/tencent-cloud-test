import S3Image from '@/components/common/medias/S3Image';
import CbtIapHeader from '@/components/pages/astrark/cbt-iap/Header';
import MainContent from '@/components/pages/astrark/cbt-iap/home/MainContent';
import { NextPage } from 'next';

const CbtIapPage: NextPage = () => {
  return (
    <section className="w-screen h-screen relative flex items-center">
      <S3Image className="object-cover" src="/astrark/cbt-iap/bg.png" fill />

      <CbtIapHeader className="!absolute left-0 top-8 w-full" />

      <MainContent />
    </section>
  );
};

export default CbtIapPage;
