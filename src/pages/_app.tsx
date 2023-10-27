import '@/styles/globals.css';
import '@/styles/dialog.css';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { createContext, useEffect, useState } from 'react';
import RootLayout from './layout';
import Loading from './components/common/Loading';
import './page.scss';
import './components/home/Footer/index.scss';
import './components/home/LineBorder/index.scss';
import './components/home/StarScreen/index.scss';
import './components/home/SwiperScreen/index.scss';
import './components/common/Belt/index.scss';
import './components/common/Loading/index.scss';
import './components/common/MediaIconBar/index.scss';
import './components/character/character.scss';
import './About/about.scss';
import './NFT/components/home.scss';
import './AstrArk/components/schoolDesc/index.scss';
import './AstrArk/components/school/Mystery/index.scss';
import './AstrArk/components/school/SchoolIcons/index.scss';
import homePlanetBg from 'img/home/planet.png';
import loadingImg from 'img/loading/bg_moon.png';
import ntf_halo1 from 'img/nft/home/halo1.png';
import ntf_halo2 from 'img/nft/home/halo2.png';
import ntf_meteor from 'img/nft/home/meteor.png';
import ntf_planet1 from 'img/nft/home/planet1.png';
import ntf_planet2 from 'img/nft/home/planet2.png';
import ntf_planet3 from 'img/nft/home/planet3.png';
import ntf_stars1 from 'img/nft/home/stars1.png';
import ntf_stars2 from 'img/nft/home/stars2.png';
import ntf_stars3 from 'img/nft/home/stars3.png';
import about_c1 from 'img/about/1@2x.png';
import about_c2 from 'img/about/2@2x.png';
import about_c3 from 'img/about/3@2x.png';
import about_c4 from 'img/about/4@2x.png';
import about_c5 from 'img/about/5@2x.png';
import sponsor_1 from 'img/about/1.png';
import sponsor_2 from 'img/about/2.png';
import sponsor_3 from 'img/about/3.png';
import sponsor_4 from 'img/about/4.png';
import sponsor_5 from 'img/about/5.png';
import sponsor_6 from 'img/about/6.png';
import sponsor_7 from 'img/about/7.png';
import sponsor_8 from 'img/about/8.png';
import sponsor_9 from 'img/about/9.png';
import sponsor_10 from 'img/about/10.png';
import sponsor_11 from 'img/about/11.png';
import sponsor_12 from 'img/about/12.png';
import sponsor_13 from 'img/about/13.png';
import sponsor_14 from 'img/about/14.png';
import sponsor_15 from 'img/about/15.png';
import sponsor_16 from 'img/about/16.png';
import sponsor_17 from 'img/about/17.png';
import sponsor_18 from 'img/about/18.png';
import sponsor_19 from 'img/about/19.png';
import sponsor_20 from 'img/about/20.png';
import sponsor_21 from 'img/about/21.png';
import sponsor_22 from 'img/about/22.png';
import Head from 'next/head';
import { LUXY_OPTIONS } from '@/constant/luxy';
import Script from 'next/script';
import astrark_bg_home from 'img/astrark/bg-home.jpg';
import astrark_bg_mask from 'img/astrark/bg-mask.png';
import astrark_bg_world_view from 'img/astrark/bg-world-view.jpg';
import usePostMessage from '@/hooks/usePostMessage';
import { useStore } from '@/store';
import UserStore from '@/store/User';
import { ToastContainer } from 'react-toastify';

async function initResources(path: string) {
  path = path.toLowerCase();
  const promises: Promise<any>[] = [];

  switch (path) {
    case '/':
    case '/home':
      promises.push(...[homePlanetBg.src].map((path) => loadImage(path)));
      promises.push(loadVideo('/video/ntfbg.webm'));
      break;
    case '/ntf':
      promises.push(
        ...[
          ntf_halo1.src,
          ntf_halo2.src,
          ntf_meteor.src,
          ntf_planet1.src,
          ntf_planet2.src,
          ntf_planet3.src,
          ntf_stars1.src,
          ntf_stars2.src,
          ntf_stars3.src,
        ].map((path) => loadImage(path)),
      );
      break;
    case '/about':
      promises.push(
        ...[
          about_c1.src,
          about_c2.src,
          about_c3.src,
          about_c4.src,
          about_c5.src,
          sponsor_1.src,
          sponsor_2.src,
          sponsor_3.src,
          sponsor_4.src,
          sponsor_5.src,
          sponsor_6.src,
          sponsor_7.src,
          sponsor_8.src,
          sponsor_9.src,
          sponsor_10.src,
          sponsor_11.src,
          sponsor_12.src,
          sponsor_13.src,
          sponsor_14.src,
          sponsor_15.src,
          sponsor_16.src,
          sponsor_17.src,
          sponsor_18.src,
          sponsor_19.src,
          sponsor_20.src,
          sponsor_21.src,
          sponsor_22.src,
        ].map((path) => loadImage(path)),
      );
      break;
    case '/astrark':
      promises.push(
        ...[astrark_bg_home.src, astrark_bg_mask.src, astrark_bg_world_view.src].map((path) => loadImage(path)),
      );
      break;
  }

  await Promise.all(promises);
}

function loadImage(path: string) {
  const img = new Image();
  img.src = path;
  img.style.display = 'none';
  document.body.appendChild(img);

  return new Promise((resolve) => {
    img.onload = function () {
      document.body.removeChild(img);
      resolve(true);
    };
  });
}

function loadVideo(path: string) {
  const video = document.createElement('video');
  video.src = path;
  video.style.display = 'none';
  document.body.appendChild(video);

  return new Promise((resolve) => {
    video.addEventListener('canplay', () => {
      document.body.removeChild(video);
      resolve(true);
    });
  });
}

export const MobxContext = createContext<UserStore>(new UserStore());

export default function App({ Component, pageProps }: AppProps) {
  const whiteList = ['/email/captcha/quickfill', '/auth'];
  const router = useRouter();
  const isInWhiteList = whiteList.includes(router.route);
  const [loading, setLoading] = useState(!isInWhiteList);
  const [resLoading, setResLoading] = useState(!isInWhiteList);
  const [scale, setScale] = useState('1');
  const store = useStore();

  function resetRem() {
    const width = document.documentElement.clientWidth;
    const fontSize = Math.max((16 * width) / 1920, 12);
    document.documentElement.style.fontSize = `${fontSize}px`;

    const ratio = window.devicePixelRatio;
    if (/windows|win32|win64|wow32|wow64/g.test(navigator.userAgent.toLowerCase())) {
      setScale((1 / ratio).toFixed(2));
    }
  }

  useEffect(() => {
    resetRem();
    const resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize';

    window.addEventListener(resizeEvt, resetRem);
    return () => window.removeEventListener(resizeEvt, resetRem);
  }, []);

  useEffect(() => {
    if (!loading) return;

    loadImage(loadingImg.src).then(async () => {
      // 仅第一次进入页面可能展示Loading
      await initResources(router.route);

      setResLoading(false);
      initResources('/');
      initResources('/ntf');
      initResources('/about');
    });
  }, []);

  useEffect(() => {
    const luxy = document.getElementById('luxy');
    if (!luxy) return;

    import('luxy.js').then((res) => {
      if (!res.default) return;

      window.luxy = res.default;
      window.luxy.getWrapperTranslateY = function () {
        const { transform } = this.wrapper.style;
        const y = transform?.match(/^translate3d\([^,]+,\s*([\d-]+)[^,]*,\s*[^,]+\)$/)?.[1] || '';
        return -y || 0;
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
    store.init();
  }, []);

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content={`width=device-width,initial-scale=${scale},minimum-scale=${scale},maximum-scale=${scale},user-scalable=no`}
        />
      </Head>
      {!isInWhiteList && loading ? (
        <Loading resLoading={resLoading} onLoaded={() => setLoading(false)} />
      ) : (
        <MobxContext.Provider value={store}>
          <RootLayout isInWhiteList={isInWhiteList}>
            <Component {...pageProps} />
          </RootLayout>

          <ToastContainer />
        </MobxContext.Provider>
      )}

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
