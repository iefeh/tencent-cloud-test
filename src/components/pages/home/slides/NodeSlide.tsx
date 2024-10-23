import S3Image from '@/components/common/medias/S3Image';
import TokenRewardProgressCountdown from '@/components/common/task/TokenRewardProgressCountdown';
import Link from '@/components/link';
import useCountdown from '@/hooks/useLoopCountDown';
import type { HomeSlide } from '@/types/lottery';
import { cn } from '@nextui-org/react';
import dayjs from 'dayjs';
import { FC, Fragment, useState } from 'react';
import { isMobile } from 'react-device-detect';

interface Props {
  needAni?: boolean;
}

const NodeSlide: FC & HomeSlide = (props: Props) => {
  const [cdNumbers, setCDNumbers] = useState(Array(4).fill('00'));
  useCountdown(+(process.env.NEXT_PUBLIC_PUCLIC_SALE_TIME || 0) || dayjs().valueOf(), dayjs().valueOf(), (time) => {
    const du = dayjs.duration(time);
    let hours: number | string = ~~du.asHours();
    if (hours > 99) hours = '99+';
    const nos = [hours, du.minutes(), du.seconds()].map((n) => n.toString().padStart(2, '0'));
    setCDNumbers(nos);
  });

  return (
    <div className="bg-entertainment w-full h-screen relative flex justify-center items-center p-12">
      <Link href={process.env.NEXT_PUBLIC_URL_NODE_SALE!} target="_blank">
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

        {process.env.NEXT_PUBLIC_PUCLIC_SALE_TIME && (
          <div
            className={cn([
              'absolute h-[2.5rem] flex justify-center items-center gap-y-4',
              isMobile ? 'left-1/2 -translate-x-1/2 top-[44%] flex-wrap' : 'right-48 bottom-32',
            ])}
          >
            <span className="mr-2 text-3xl text-basic-yellow font-semibold drop-shadow whitespace-nowrap">
              Public Sale starts in
            </span>

            {cdNumbers.map((no, index) => (
              <Fragment key={index}>
                {index > 0 && <span className="mx-1">:</span>}
                <div
                  className={cn([
                    'px-1 bg-[#E0D1B1] rounded-five text-brown text-center font-semibold',
                    'text-2xl h-full min-w-[2.5rem] leading-[2.5rem]',
                  ])}
                >
                  {no}
                </div>
              </Fragment>
            ))}
          </div>
        )}
      </Link>
    </div>
  );
};

NodeSlide.hasVideo = !isMobile;

export default NodeSlide;
