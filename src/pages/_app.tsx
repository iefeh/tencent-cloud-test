import '@/styles/globals.css';
import '@/styles/dialog.css';
import '@/styles/transition.scss';
import '@/styles/table.css';
import '@/styles/ani.scss';
import '@/styles/scrollbar.scss';
import '@/styles/swiper.scss';
import '@/styles/video.scss';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { createContext, useState } from 'react';
import RootLayout from './layout';
import Loading from './components/common/Loading';
import './page.scss';
import '@/components/pages/home/Footer/index.scss';
import '@/components/common/LineBorder/index.scss';
import '@/components/pages/home/StarScreen/index.scss';
import '@/components/pages/home/SwiperScreen/index.scss';
import './components/common/Belt/index.scss';
import './components/common/Loading/index.scss';
import '@/components/common/MediaIconBar/index.scss';
import './components/character/character.scss';
import './NFT/components/home.scss';
import '@/components/pages/astrark/home/schoolDesc/index.scss';
import '@/components/pages/astrark/home/school/Mystery/index.scss';
import '@/components/pages/astrark/home/school/SchoolIcons/index.scss';
import './TetraNFT/components/PrivilegeScreen/index.scss';
import './TetraNFT/components/IndexScreen/MainTitle/index.scss';
import 'video.js/dist/video-js.css';
import Head from 'next/head';
import Script from 'next/script';
import usePostMessage from '@/hooks/usePostMessage';
import UserStore from '@/store/User';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@/styles/toastify.css';
import BetterScroll from 'better-scroll';
import Pullup from '@better-scroll/pull-up';
import MouseWheel from '@better-scroll/mouse-wheel';
import useRouteLocale from '@/hooks/useRouteLocale';
import { NextUIProvider } from '@nextui-org/react';
import '@/styles/aa.scss';
import useEventTracking from '@/hooks/useEventTracking';
import useRootLuxy from '@/hooks/common/useRootLuxy';
import useRem from '@/hooks/common/useRem';
import useCheckRouter from '@/hooks/common/useCheckRouter';
import useRouterInviteCode from '@/hooks/common/useRouterInviteCode';
import useUserInit from '@/hooks/common/useUserInit';

BetterScroll.use(MouseWheel);
BetterScroll.use(Pullup);

export const MobxContext = createContext<UserStore>(new UserStore());

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const { isInWhiteList, hasNoHeader } = useCheckRouter();
  const [loading, setLoading] = useState(!isInWhiteList);
  const getLayout =
    (Component as BasePage).getLayout ||
    ((page) => (
      <RootLayout
        isInWhiteList={isInWhiteList}
        hasNoHeader={hasNoHeader}
        hideLoginCloseButton={(Component as BasePage).hideLoginCloseButton}
      >
        {page}
      </RootLayout>
    ));

  const { scale } = useRem(); // rem页面布局响应逻辑

  useRouterInviteCode(); // 检测路由的邀请码参数

  useEventTracking(); // 埋点初始化

  useRootLuxy(); // 初始化luxy滚动效果

  usePostMessage();

  useRouteLocale(); // 多语言路由功能逻辑

  useUserInit(); // 用户数据初始化

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content={`width=device-width,initial-scale=${scale},minimum-scale=${scale},maximum-scale=${scale},user-scalable=no`}
        />

        <script
          dangerouslySetInnerHTML={{
            __html: `
            window.Storage.prototype.read = function (key) {
              const val = this.getItem(key);
              if (!val) return null;
              return JSON.parse(val);
            };
  
            window.Storage.prototype.save = function(key, val) {
              this.setItem(key, JSON.stringify(val || ''));
            };
          `,
          }}
        ></script>

        <link rel="preload" as="image" href="/img/loading/bg_moon.png" crossOrigin="anonymous"></link>
      </Head>

      <NextUIProvider navigate={router.push}>
        {!isInWhiteList && loading ? (
          <Loading onLoaded={() => setLoading(false)} />
        ) : (
          getLayout(<Component {...pageProps} />)
        )}
      </NextUIProvider>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar closeOnClick theme="dark" />

      <Script id="google-analytics">
        {`
          (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
          (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
          m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
          })(window,document,'script','https://www.googletagmanager.com/gtag/js?id=G-S033BWR07Y','ga');

          window.dataLayer = window.dataLayer || [];
          function gtag() {
            dataLayer.push(arguments);
          }
          gtag('js', new Date());
          gtag('config', 'G-S033BWR07Y');
        `}
      </Script>
    </>
  );
}
