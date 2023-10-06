import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Router, useRouter } from "next/router";
import { useEffect, useState } from "react";
import RootLayout from "./layout";
import Loading from "./components/common/Loading";
import "./page.scss";
import "./components/home/Footer/index.scss";
import "./components/home/LineBorder/index.scss";
import "./components/home/StarScreen/index.scss";
import "./components/home/SwiperScreen/index.scss";
import "./components/common/Belt/index.scss";
import "./components/common/Loading/index.scss";
import "./components/common/MediaIconBar/index.scss";
import "./components/character/character.scss";
import "./About/about.scss";
import "./NFT/components/home.scss";
import "./AstrArk/components/home/index.scss";
import "./AstrArk/components/schoolDesc/index.scss";
import "./AstrArk/components/school/Mystery/index.scss";
import "./AstrArk/components/school/SchoolIcons/index.scss";
import "./AstrArk/components/worldView/index.scss";
import homePlanetBg from "img/home/planet.png";

async function initResources(path: string) {
  path = path.toLowerCase();
  let resources: string[] = [];

  switch (path) {
    case "/":
    case "/home":
      resources = [homePlanetBg.src];
      break;
  }

  await Promise.all(resources.map((res) => loadImage(res)));
}

async function loadImage(path: string) {
  const img = new Image();
  img.src = path;
  img.style.display = "none";
  document.body.appendChild(img);

  img.onload = function () {
    document.body.removeChild(img);
  };
}

export default function App({ Component, pageProps }: AppProps) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    initResources(router.route).then(() => setLoading(false));

    const startLoading = (path: string) => {
      setLoading(true);
    };

    const stopLoading = async (path: string) => {
      await initResources(path);
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
    <RootLayout loading={loading}>
      {loading ? <Loading /> : <Component {...pageProps} />}
    </RootLayout>
  );
}
