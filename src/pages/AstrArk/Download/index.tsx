import Image from 'next/image';
import maskBg from 'img/astrark/bg-mask.png';
import styles from './index.module.css';
import { Button, cn, useDisclosure } from '@nextui-org/react';
import Head from 'next/head';
import FloatRegisterButton from '@/components/pages/astrark/home/FloatRegisterButton';
import Link from 'next/link';
import AppStoreTipsModal from '@/components/pages/astrark/download/AppStoreTipsModal';

export default function DownloadPage() {
  const disclosure = useDisclosure();

  // function onDownloadClick() {
  //   window.open(process.env.NEXT_PUBLIC_ASTRARK_DOWNLOAD_URL!, '_blank');
  // }

  function onAppStore() {
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

      <div className=" absolute left-1/2 -translate-x-1/2 bottom-[12.6%] flex flex-col md:flex-row items-center gap-[0.625rem]">
        {/* <Button
          className="w-[19.6875rem] h-[4.375rem] bg-[url('/img/astrark/pre-register/bg_btn_colored.png')] bg-cover bg-no-repeat !bg-transparent font-semakin text-black text-2xl"
          disableRipple
          onPress={onDownloadClick}
        >
          Download Now
        </Button> */}

        <Button
          className="w-[13.25rem] h-[4.375rem] bg-[url('/img/astrark/btn_app_store.png')] bg-cover bg-no-repeat !bg-transparent"
          disableRipple
          onPress={onAppStore}
        />

        <Link href={process.env.NEXT_PUBLIC_ASTRARK_GOOGLE_PLAY_URL!} target="_blank">
          <Button
            className="w-[13.25rem] h-[4.375rem] bg-[url('/img/astrark/btn_google_play.png')] bg-cover bg-no-repeat !bg-transparent"
            disableRipple
          />
        </Link>
      </div>

      <FloatRegisterButton />

      <AppStoreTipsModal disclosure={disclosure} />
    </div>
  );
}
