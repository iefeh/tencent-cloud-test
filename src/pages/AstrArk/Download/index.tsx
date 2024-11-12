import Image from 'next/image';
import maskBg from 'img/astrark/bg-mask.png';
import styles from './index.module.scss';
import { Button, cn, useDisclosure } from '@nextui-org/react';
import Head from 'next/head';
import FloatRegisterButton from '@/components/pages/astrark/home/FloatRegisterButton';
import AppStoreTipsModal from '@/components/pages/astrark/download/AppStoreTipsModal';
import { useState } from 'react';
import LGButton from '@/pages/components/common/buttons/LGButton';
import AlphaTestGuidelinesModal from '@/components/pages/astrark/download/AlphaTestGuidelinesModal';
import Link from '@/components/link';
import { downloadFile } from '@/hooks/utils';

interface DownloadURL {
  title?: string;
  img?: string;
  url: string;
  isAppStore?: boolean;
  className?: string;
  label?: string;
  onClick?: () => void;
}

export default function DownloadPage() {
  const disclosure = useDisclosure();
  const guidelinesDisclosure = useDisclosure();
  const [appStoreURL, setAppStoreURL] = useState('');
  const urls: DownloadURL[] = [
    {
      // title: 'English Version',
      img: 'https://d3dhz6pjw7pz9d.cloudfront.net/astrark/download/btn_app_store.png',
      url: process.env.NEXT_PUBLIC_ASTRARK_APP_STORE_URL!,
      isAppStore: true,
    },
    // {
    //   title: '日本語版',
    //   img: 'https://d3dhz6pjw7pz9d.cloudfront.net/astrark/download/btn_app_store.png',
    //   url: process.env.NEXT_PUBLIC_ASTRARK_APP_STORE_JP_URL!,
    //   isAppStore: true,
    // },
    {
      // title: 'English Version',
      img: 'https://d3dhz6pjw7pz9d.cloudfront.net/astrark/download/btn_google_play.png',
      url: process.env.NEXT_PUBLIC_ASTRARK_GOOGLE_PLAY_URL!,
    },
    // {
    //   title: 'Android 日本語版',
    //   className: styles.downloadBtn,
    //   label: 'ダウンロード',
    //   url: process.env.NEXT_PUBLIC_ASTRARK_GOOGLE_PLAY_JP_URL!,
    // },
    {
      // title: 'English Version',
      className: styles.downloadBtn,
      label: 'Download',
      url: process.env.NEXT_PUBLIC_AA_DOWNLOAD_URL!,
      isAppStore: true,
      onClick: function () {
        downloadFile(this.url, 'AstrArk.apk');
      },
    },
  ];

  function onAppStore(url: string) {
    setAppStoreURL(url);
    disclosure.onOpen();
  }

  return (
    <div className="w-full h-screen flex justify-center items-center overflow-hidden">
      <Head>
        <link rel="preload" as="image" href="/img/astrark/bg-mask.png" crossOrigin="anonymous"></link>
      </Head>

      <div className="absolute left-0 top-0 w-full h-full z-0">
        <video
          className={cn(['object-cover w-full h-full', styles.maskVideo])}
          autoPlay
          playsInline
          muted
          loop
          preload="auto"
          poster="/img/astrark/bg-home.jpg"
        >
          <source src="/video/astrark.webm" />
        </video>

        <Image className="object-cover z-10 opacity-100" src={maskBg} alt="" fill unoptimized />
      </div>

      <div className=" absolute left-1/2 -translate-x-1/2 bottom-[10%] flex flex-col items-center mb-6">
        <div className="flex flex-col md:flex-row items-center gap-[0.625rem]">
          {urls.map((item, index) => {
            let button = (
              <Button
                className={cn([
                  'w-[13.25rem] h-[4.375rem] bg-contain bg-center bg-no-repeat !bg-transparent font-semakin text-black text-2xl',
                  item.className,
                ])}
                style={item.img ? { backgroundImage: `url('${item.img}')` } : {}}
                disableRipple
                onClick={item.isAppStore ? () => (item.onClick ? item.onClick() : onAppStore(item.url)) : undefined}
              >
                <span className="relative z-10">{item.label}</span>
              </Button>
            );

            if (!item.isAppStore) {
              button = (
                <Link href={item.url} target="_blank">
                  {button}
                </Link>
              );
            }

            return (
              <div key={index} className="flex flex-col items-center">
                {item.title && <p className="text-xl mb-2">{item.title}</p>}

                {button}
              </div>
            );
          })}
        </div>

        {/* <LGButton className="h-12 mt-6" label="Alpha Test Guidelines" onClick={guidelinesDisclosure.onOpen} /> */}
      </div>

      <FloatRegisterButton />

      <AppStoreTipsModal url={appStoreURL} disclosure={disclosure} />

      <AlphaTestGuidelinesModal disclosure={guidelinesDisclosure} />
    </div>
  );
}
