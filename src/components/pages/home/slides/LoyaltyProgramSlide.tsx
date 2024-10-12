import { HomeSlide } from '@/types/lottery';
import { useRouter } from 'next/router';
import { FC } from 'react';

interface Props {
  needAni?: boolean;
}

const LoyaltyProgramSlide: FC & HomeSlide = (props: Props) => {
  const router = useRouter();
  function onExplore() {
    router.push('/LoyaltyProgram/season/foresight');
  }

  return (
    <div
      className="bg-entertainment w-full h-screen relative flex justify-center items-center p-12"
      onClick={onExplore}
    >
      <video
        className="object-cover w-full h-full absolute left-0 top-0 z-0 rounded-[1.25rem] cursor-pointer"
        autoPlay
        playsInline
        muted
        loop
        preload="auto"
      >
        <source src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/home/loyalty_program.webm" />
      </video>
    </div>
  );
};

LoyaltyProgramSlide.hasVideo = true;

export default LoyaltyProgramSlide;
