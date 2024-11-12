import React from 'react';
import Header from '@/components/Header';
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
import { AuthCoreContextProvider } from '@particle-network/auth-core-modal';
import useCheckNoviceBadge from '@/hooks/events/useCheckNoviceBadge';

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

  useCheckNoviceBadge(); // Novice Notch活动提示

  return (
    <AuthCoreContextProvider
      options={{
        projectId: '6e3c69f1-f726-405a-8277-93542a2e602d',
        clientKey: 'cqTW7Q9qUDlZOhZ0uTiwDYP3BidmCrx2eWlNHzSZ',
        appId: 'f9d66501-274a-4a88-9848-5749641693d6',
        promptSettingConfig: {
          promptMasterPasswordSettingWhenLogin: 0,
          promptPaymentPasswordSettingWhenSign: 0,
        },
        wallet: {
          visible: false,
        },
      }}
    >
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
    </AuthCoreContextProvider>
  );
}
