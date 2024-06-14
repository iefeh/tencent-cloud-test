import PageDesc from '@/components/common/PageDesc';
import Image from 'next/image';
import { FC } from 'react';

const CoverScreen: FC = () => {
  return (
    <div className="relative w-screen h-screen flex justify-center items-center">
      <Image
        src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/lottery/bg_cover.png"
        alt=""
        fill
        unoptimized
      />

      <PageDesc
        className="relative z-0"
        needAni
        baseAniTY
        title={
          <div className="text-6xl uppercase font-semakin">
            <span>Welcome to</span>
            <span className="bg-gradient-to-b to-[#D9A970] from-[#EFEBC5] bg-clip-text text-transparent">
              “More and $MORE”{' '}
            </span>
          </div>
        }
        subtitle={
          <div className="text-lg font-decima mb-10 tracking-tighter max-w-[32rem] mx-auto text-center mt-4">
            Join our &apos;More and $MORE!&apos; lottery!
            <br />
            Spend a little, win a lot!
            <br />
            Don&apos;t miss out on your chance to win big!
          </div>
        }
      />
    </div>
  );
};

export default CoverScreen;
