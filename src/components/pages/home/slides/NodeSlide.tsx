import S3Image from '@/components/common/medias/S3Image';
import Link from '@/components/link';
import type { HomeSlide } from '@/types/lottery';
import { FC } from 'react';
import { isMobile } from 'react-device-detect';

interface Props {
  needAni?: boolean;
}

const NodeSlide: FC & HomeSlide = (props: Props) => {
  return (
    <div className="bg-entertainment w-full h-screen relative flex justify-center items-center p-12">
      <Link href={process.env.NEXT_PUBLIC_URL_NODE_SALE!} target='_blank'>
        {isMobile ? (
          <S3Image className="object-cover" src="/home/bg_home_swiper_node_sale.png" fill />
        ) : (
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
        )}
      </Link>
    </div>
  );
};

NodeSlide.hasVideo = !isMobile;

export default NodeSlide;
