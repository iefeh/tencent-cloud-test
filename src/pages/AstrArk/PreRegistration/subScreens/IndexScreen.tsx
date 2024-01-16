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
  return (
    <div className="w-screen h-screen 4xl:h-[67.5rem] bg-[url('/img/astrark/pre-register/bg_index_screen.jpg')] bg-no-repeat bg-cover relative px-16 lg:px-0">
      <div className="absolute right-0 top-0 z-0 w-[54.125rem] h-[67.5rem]">
        <Image className="object-cover" src={roleImg} alt="" fill />
      </div>

      <div className="relative w-full h-full z-10 flex flex-col justify-center items-center text-center mt-4 lg:mt-0">
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

        <Image className="mt-6 w-9 h-9 object-cover select-none hidden lg:block" src={arrowLRImg} alt="" />

        <div className="mt-2 lg:mt-8 flex items-center">
          {preInfo?.preregistered ? <ShareButton /> : <PreRegisterButton onPreRegistered={onPreRegistered} />}
        </div>
      </div>
    </div>
  );
}
