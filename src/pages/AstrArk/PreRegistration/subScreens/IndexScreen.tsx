import Image from 'next/image';
import roleImg from 'img/astrark/pre-register/index_role.png';
import arrowLRImg from 'img/astrark/pre-register/arrow_lr.png';
import RewardSwiper from '../components/RewardSwiper';
import { Button } from '@nextui-org/react';
import { useRouter } from 'next/router';
import arrowIconImg from 'img/astrark/icon_arrow.png';
import { PreRegisterInfoDTO } from '@/http/services/astrark';
import ShareButton from '../components/ShareButton';
import PreRegisterButton from '../components/PreRegisterButton';

export default function IndexScreen({
  preInfo,
  onPreRegistered,
}: {
  preInfo: PreRegisterInfoDTO | null;
  onPreRegistered?: () => void;
}) {
  const router = useRouter();

  function onFloatClick() {
    router.push('/AstrArk/Download');
  }

  return (
    <div className="w-screen h-screen 4xl:h-[67.5rem] bg-[url('/img/astrark/pre-register/bg_index_screen.jpg')] bg-no-repeat bg-cover relative px-16 lg:px-0">
      <div className="absolute right-0 top-0 z-0 w-[54.125rem] h-[67.5rem]">
        <Image className="object-cover" src={roleImg} alt="" fill />
      </div>

      <div className="relative w-full h-full z-10 flex flex-col justify-center items-center text-center">
        <div className="p-2 bg-clip-text bg-[linear-gradient(-50deg,_#DBAC73_0%,_#F1EEC9_33.203125%,_#F1EEC9_82.5927734375%,_#CFA36F_100%)]">
          <div className="font-semakin text-transparent text-6xl">
            Pre-Registration
            <br />
            Rewards
          </div>
        </div>

        <div className="font-poppins text-lg mt-[1.375rem]">
          Join the adventure with{' '}
          <span className="font-semakin text-basic-yellow text-2xl">
            {preInfo ? preInfo.total.replace(/(\d)(?=(?:\d{3})+$)/g, '$1,') : '0'}
          </span>{' '}
          Commanders registered for AstrArk! Let&apos;s embark together!
        </div>

        <RewardSwiper />

        <Image className="mt-6 w-9 h-9 object-cover select-none" src={arrowLRImg} alt="" />

        <div className="mt-8 flex items-center">
          {preInfo?.preregistered ? <ShareButton /> : <PreRegisterButton onPreRegistered={onPreRegistered} />}
        </div>
      </div>

      <Button
        className="w-[17.75rem] h-[10.25rem] bg-[url('/img/astrark/pre-register/bg_view_game_lore.png')] bg-cover bg-no-repeat bg-transparent absolute left-[4.875rem] bottom-[4.875rem] z-20 font-semakin text-[1.75rem] text-left"
        disableRipple
        onPress={onFloatClick}
      >
        {/* <span>
          View
          <Image
            className="inline-block w-[1.25rem] h-[1.25rem] align-middle relative -top-1 ml-3"
            src={arrowIconImg}
            alt=""
          />
          <br />
          Game Lore
        </span> */}
        Alpha Test
        <br />
        Download
      </Button>
    </div>
  );
}
