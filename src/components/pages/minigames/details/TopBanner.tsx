import Image from 'next/image';
import { FC } from 'react';

const TopBanner: FC = () => {
  const keywords = Array(4).fill('keyword');

  return (
    <div className="w-screen h-screen relative flex flex-col justify-end">
      <Image
        className="object-cover"
        src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/minigames/bg_top_logo.png"
        alt=""
        fill
        sizes="100%"
        unoptimized
      />

      <div className="relative z-0 pl-[16.25rem] mb-9">
        <div className="text-5xl">Puffy 2048</div>

        <div className="flex items-center gap-x-2 mt-[1.125rem]">
          {keywords.map((kw, index) => (
            <div key={index} className="py-ten px-4 bg-white/20 rounded-five">
              {kw}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopBanner;
