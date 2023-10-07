import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
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
import loadingImg from "img/loading/bg_moon.png";
import ntf_halo1 from "img/nft/home/halo1.png";
import ntf_halo2 from "img/nft/home/halo2.png";
import ntf_meteor from "img/nft/home/meteor.png";
import ntf_planet1 from "img/nft/home/planet1.png";
import ntf_planet2 from "img/nft/home/planet2.png";
import ntf_planet3 from "img/nft/home/planet3.png";
import ntf_stars1 from "img/nft/home/stars1.png";
import ntf_stars2 from "img/nft/home/stars2.png";
import ntf_stars3 from "img/nft/home/stars3.png";

async function initResources(path: string) {
  path = path.toLowerCase();
  let resources: string[] = [loadingImg.src];

  switch (path) {
    case "/":
    case "/home":
      resources.push(...[homePlanetBg.src]);
      break;
    case "/ntf":
      resources.push(
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
        ]
      );
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
  const router = useRouter();
  const isHome = router.route === "/" || router.route === "/home";
  const [loading, setLoading] = useState(isHome);
  const [resLoading, setResLoading] = useState(isHome);

  useEffect(() => {
    if (!loading || !isHome) return;

    // 仅第一次进入页面可能展示Loading
    initResources(router.route).then(() => {
      setResLoading(false);
      initResources('/ntf');
    });
  }, []);

  return loading ? (
    <Loading resLoading={resLoading} onLoaded={() => setLoading(false)} />
  ) : (
    <RootLayout>
      <Component {...pageProps} />
    </RootLayout>
  );
}
