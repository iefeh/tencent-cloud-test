import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
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
import './AstrArk/components/worldView/index.scss';
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
import Head from 'next/head';

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
        ...[about_c1.src, about_c2.src, about_c3.src, about_c4.src, about_c5.src].map((path) => loadImage(path)),
      );
      break;
    case '/astrark':
      promises.push(loadVideo('/video/astrark.mp4'));
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

function delay(timeout: number) {
  return new Promise((resolve) => setTimeout(resolve, timeout));
}

function loadVideo(path: string) {
  const video = document.createElement('video');
  video.src = path;
  video.style.display = 'none';
  document.body.appendChild(video);

  return new Promise(async (resolve) => {
    while (video.readyState !== 4) {
      await delay(100);
    }

    document.body.removeChild(video);
    resolve(true);
  });
}

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [resLoading, setResLoading] = useState(true);

  function resetRem() {
    let ratio = 1;
    const u = navigator.userAgent;
    const isiOS = /\(i[^;]+;( U;)? CPU.+Mac OS X/.test(u);
    if (isiOS) {
      ratio = window.devicePixelRatio;
    }
    const width = document.documentElement.clientWidth;
    let fontSize = 16;
    if (width >= 1024) {
      fontSize *= width / 1920 / ratio;
    } else {
      fontSize *= width / 375 / ratio;
    }
    document.documentElement.style.fontSize = `${fontSize}px`;
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
    import('luxy.js').then((res) => {
      if (!res.default) return;
      
      try {
        res.default.init({
          wrapper: '#luxy',
          targets: '.luxy-el',
          wrapperSpeed: 0.05,
        });
      } catch (error) {
        console.log(error);
      }
    });
  });

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no"
        />
      </Head>
      {loading ? (
        <Loading resLoading={resLoading} onLoaded={() => setLoading(false)} />
      ) : (
        <RootLayout>
          <Component {...pageProps} />
        </RootLayout>
      )}
    </>
  );
}
