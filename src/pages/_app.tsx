import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { Router } from 'next/router';
import { useEffect, useState } from 'react';
import RootLayout from './layout';
import Loading from './components/common/Loading';
import "./page.scss";
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
import './AstrArk/components/home/index.scss';
import './AstrArk/components/schoolDesc/index.scss';
import './AstrArk/components/school/Mystery/index.scss';
import './AstrArk/components/school/SchoolIcons/index.scss';
import './AstrArk/components/worldView/index.scss';

export default function App({ Component, pageProps }: AppProps) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const startLoading = () => {
      setLoading(true);
    };

    const stopLoading = () => {
      setLoading(false);
    };

    Router.events.on("routeChangeStart", startLoading);
    Router.events.on("routeChangeComplete", stopLoading);
    Router.events.on("routeChangeError", stopLoading);

    return () => {
      Router.events.off("routeChangeStart", startLoading);
      Router.events.off("routeChangeComplete", stopLoading);
      Router.events.off("routeChangeError", stopLoading);
    };
  }, []);

  return (
    <RootLayout>
      {loading ? <Loading /> : <Component {...pageProps} />}
    </RootLayout>
  );
}
