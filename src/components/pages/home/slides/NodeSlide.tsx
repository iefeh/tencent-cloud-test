import type { HomeSlide } from '@/types/lottery';
import { FC } from 'react';

interface Props {
  needAni?: boolean;
}

const NodeSlide: FC & HomeSlide = (props: Props) => {
  return (
    <div className="bg-entertainment w-full h-screen relative flex justify-center items-center p-12">
      <video
        className="object-cover w-full h-full absolute left-0 top-0 z-0 rounded-[1.25rem] cursor-pointer"
        autoPlay
        playsInline
        muted
        loop
        preload="auto"
      >
        <source
          src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/home/Moonveil+Public+Round+Start+video.webm"
          type="video/webm"
        />
      </video>
    </div>
  );
};

NodeSlide.hasVideo = true;

export default NodeSlide;
