import '@/styles/globals.css';
import '@/styles/dialog.css';
import '@/styles/transition.scss';
import '@/styles/table.css';
import '@/styles/ani.scss';
import '@/styles/scrollbar.scss';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { createContext, useEffect, useState } from 'react';
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
import { LUXY_OPTIONS } from '@/constant/luxy';
import Script from 'next/script';
import usePostMessage from '@/hooks/usePostMessage';
import { useStore } from '@/store';
import UserStore from '@/store/User';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@/styles/toastify.css';
import { KEY_INVITE_CODE } from '@/constant/storage';
import BetterScroll from 'better-scroll';
import Pullup from '@better-scroll/pull-up';
import MouseWheel from '@better-scroll/mouse-wheel';
import useRouteLocale from '@/hooks/useRouteLocale';
import { NextUIProvider } from '@nextui-org/react';
import '@/styles/aa.scss';
import useEventTracking from '@/hooks/useEventTracking';

BetterScroll.use(MouseWheel);
BetterScroll.use(Pullup);

export const MobxContext = createContext<UserStore>(new UserStore());

export default function App({ Component, pageProps }: AppProps) {
  const whiteList = ['/email/captcha/quickfill', '/auth', '/auth/connect', '/oauth', '/AstrArk/assets'];
  const noHeaderList = ['/email/captcha/quickfill', '/auth', '/auth/connect', '/oauth', '/AstrArk/assets'];
  const noInitList = ['/email/captcha/quickfill', '/auth', '/auth/connect', '/AstrArk/assets', '/AstrArk/shop'];
  const aaMobileList = ['/AstrArk/deleteAccount', '/AstrArk/shop'];
  const router = useRouter();
  const isInWhiteList = whiteList.includes(router.route);
  const hasNoHeader = noHeaderList.includes(router.route);
  const noNeedInit = noInitList.includes(router.route);
  const isAAMobile = aaMobileList.includes(router.route);
  const [loading, setLoading] = useState(!isInWhiteList);
  const [scale, setScale] = useState('1');
  const store = useStore();
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

  if (router.query.invite_code) {
    localStorage.setItem(KEY_INVITE_CODE, (router.query?.invite_code as string) || '');
  }

  function resetRem() {
    const width = document.documentElement.clientWidth;
    const fontSize = Math.max((16 * width) / 1920, isAAMobile ? 10 : 12);
    document.documentElement.style.fontSize = `${fontSize}px`;

    const ratio = window.devicePixelRatio;
    if (/windows|win32|win64|wow32|wow64/g.test(navigator.userAgent.toLowerCase())) {
      setScale((1 / ratio).toFixed(2));
    }
  }

  useEventTracking();

  useEffect(() => {
    resetRem();
    const resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize';

    window.addEventListener(resizeEvt, resetRem);
    return () => window.removeEventListener(resizeEvt, resetRem);
  }, []);

  useEffect(() => {
    const luxy = document.getElementById('luxy');
    if (!luxy) return;

    import('luxy.js').then((res) => {
      if (!res.default) return;

      window.luxy = res.default;
      window.luxy.getWrapperTranslateY = function () {
        if (!this.wrapper) return;
        try {
          const { transform } = this.wrapper.style;
          const y = transform?.match(/^translate3d\([^,]+,\s*([\d-]+)[^,]*,\s*[^,]+\)$/)?.[1] || '';
          return -y || 0;
        } catch (error) {
          return 0;
        }
      };
      window.luxy.disable = function () {
        const { resizeId, scrollId } = this;
        cancelAnimationFrame(resizeId);
        cancelAnimationFrame(scrollId);
        this.disabled = true;
      };
      window.luxy.enable = function () {
        this.wapperOffset = this.getWrapperTranslateY();
        try {
          this.init(LUXY_OPTIONS);
        } catch (error) {
          console.log(error);
        }
        this.disabled = false;
      };
      window.luxy.disable();

      try {
        res.default.init(LUXY_OPTIONS);
      } catch (error) {
        console.log(error);
      }
    });
  });

  usePostMessage();

  useEffect(() => {
    if (noNeedInit) return;
    store.init();
  }, []);

  useRouteLocale(store);

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
