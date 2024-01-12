import Image from 'next/image';
import maskBg from 'img/astrark/bg-mask.png';
import styles from './index.module.css';
import { Button, cn } from '@nextui-org/react';
import arrowIconImg from 'img/astrark/icon_arrow.png';
import { useRouter } from 'next/router';
import { downloadFile } from '@/hooks/utils';

export default function DownloadPage() {
  const router = useRouter();

  function onFloatClick() {
    router.push('/AstrArk/PreRegistration');
  }

  function onDownloadClick() {
    downloadFile(process.env.NEXT_PUBLIC_ASTRARK_DOWNLOAD_URL!);
  }

  function onGooglePlayClick() {
    window.open(process.env.NEXT_PUBLIC_ASTRARK_GOOGLE_PLAY_URL, '_blank');
  }

  return (
    <div className="w-full h-screen flex justify-center items-center overflow-hidden">
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

        <Image className="object-cover z-10 opacity-100" src={maskBg} alt="" fill />
      </div>

      <div className=" absolute left-1/2 -translate-x-1/2 bottom-[12.6%] flex items-center">
        <Button
          className="w-[19.6875rem] h-[4.375rem] bg-[url('/img/astrark/pre-register/bg_btn_colored.png')] bg-cover bg-no-repeat !bg-transparent font-semakin text-black text-2xl"
          disableRipple
          onPress={onDownloadClick}
        >
          Download Now
        </Button>

        <Button
          className="w-[13.25rem] h-[4.375rem] bg-[url('/img/astrark/btn_google_play.png')] bg-cover bg-no-repeat !bg-transparent ml-[0.625rem]"
          disableRipple
          onPress={onGooglePlayClick}
        />
      </div>

      <Button
        className="w-[17.75rem] h-[10.25rem] bg-[url('/img/astrark/bg_register_now.png')] bg-cover bg-no-repeat bg-transparent absolute left-[4.875rem] bottom-[4.875rem] z-20 font-semakin text-[1.75rem] text-left"
        disableRipple
        onPress={onFloatClick}
      >
        <span>
          Register
          <br />
          Now
          <Image
            className="inline-block w-[1.25rem] h-[1.25rem] align-middle relative -top-1 ml-3"
            src={arrowIconImg}
            alt=""
          />
        </span>
      </Button>
    </div>
  );
}
