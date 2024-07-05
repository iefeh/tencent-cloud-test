import React from 'react';
import Header from './components/common/Header';
import LineBorder from '@/components/common/LineBorder';
import { Suspense } from 'react';
import Loading from './components/common/Loading';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import 'swiper/css/navigation';
import LoginModal from './components/common/LoginModal';
import { Web3ModalProvider } from '@/store/Web3Modal';
import { useStore } from '@/store';
import { BattlePassContext, useBattlePassStore } from '@/store/BattlePass';
import { MobxContext } from './_app';

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
  const store = useStore();
  const bpStore = useBattlePassStore();
  const content = (
    <>
      {hasNoHeader || <Header />}

      <main className="dark page-container w-full h-full">{children}</main>

      <LoginModal hideCloseButton={hideLoginCloseButton} />
    </>
  );

  return (
    <Web3ModalProvider>
      <MobxContext.Provider value={store}>
        <BattlePassContext.Provider value={bpStore}>
          <React.Fragment>
            <LineBorder />

            {isInWhiteList ? content : <Suspense fallback={<Loading />}>{content}</Suspense>}
          </React.Fragment>
        </BattlePassContext.Provider>
      </MobxContext.Provider>
    </Web3ModalProvider>
  );
}
