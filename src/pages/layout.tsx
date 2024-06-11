import React from 'react';
import Header from './components/common/Header';
import LineBorder from './components/home/LineBorder/index';
import { Suspense } from 'react';
import Loading from './components/common/Loading';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import 'swiper/css/navigation';
import LoginModal from './components/common/LoginModal';

export default function RootLayout({
  children,
  isInWhiteList,
  hasNoHeader,
  hideLoginCloseButton,
}: {
  children: React.ReactNode;
  isInWhiteList: boolean;
  hasNoHeader: boolean;
  hideLoginCloseButton?: boolean;
}) {
  const content = (
    <>
      {hasNoHeader || <Header />}

      <main className="dark page-container w-full h-full">{children}</main>

      <LoginModal hideCloseButton={hideLoginCloseButton} />
    </>
  );

  return (
    <React.Fragment>
      <LineBorder />

      {/* <main
        className="flex w-full h-screen flex-col items-center justify-between relative bg-black"
        id="main-layout"
      > */}
      {isInWhiteList ? content : <Suspense fallback={<Loading />}>{content}</Suspense>}
      {/* </main> */}
    </React.Fragment>
  );
}
