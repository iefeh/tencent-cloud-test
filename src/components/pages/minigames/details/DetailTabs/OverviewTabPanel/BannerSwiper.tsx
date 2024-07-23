import Video from '@/pages/components/common/Video';
import Image from 'next/image';
import { FC, useState } from 'react';
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import styles from './index.module.scss';
import { cn } from '@nextui-org/react';

interface MediaItem {
  videoSrc?: string;
  imageSrc: string;
}

const BannerSwiper: FC = () => {
  const [medias, setMedias] = useState<MediaItem[]>([
    {
      videoSrc: 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/home/loyalty_program.webm',
      imageSrc: 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/home/bg_home_swiper_discord_invite.png',
    },
    {
      imageSrc:
        'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/campaign/profile/2048/8366e834-0048-472e-b10d-ef9369f0f223/2048.png',
    },
    {
      imageSrc:
        'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/campaign/profile/2048/8366e834-0048-472e-b10d-ef9369f0f223/2048ROUND_II.png',
    },
    {
      imageSrc:
        'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/campaign/profile/2048/8366e834-0048-472e-b10d-ef9369f0f223/2048ROUND_III.png',
    },
    {
      imageSrc:
        'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/campaign/profile/2048/8366e834-0048-472e-b10d-ef9369f0f223/2048ticket.png',
    },
    {
      imageSrc:
        'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/campaign/profile/2048/8366e834-0048-472e-b10d-ef9369f0f223/prop_master.png',
    },
  ]);
  const [activeMedia, setActiveMedia] = useState<MediaItem>(medias[0]);

  return (
    <div className="bg-[#F7E9CC] px-[1.875rem] py-[2.4375rem] rounded-[1.25rem]">
      <div className="wrapper w-[50rem]">
        <div className="relative w-full h-[28.125rem]">
          {activeMedia.videoSrc ? (
            <Video
              className={cn(['rounded-base overflow-hidden', styles.puffyVideo])}
              options={{ poster: activeMedia.imageSrc, sources: [{ src: activeMedia.videoSrc, type: 'video/webm' }] }}
            />
          ) : (
            <Image
              className="rounded-base object-contain"
              src={activeMedia.imageSrc}
              alt=""
              fill
              sizes="100%"
              unoptimized
              priority
            />
          )}
        </div>

        <div className="mt-[1.375rem] max-w-full relative">
          <Swiper
            modules={[Navigation]}
            navigation={{ prevEl: '.navi-prev', nextEl: '.navi-next' }}
            loop={false}
            freeMode={true}
            slidesPerView="auto"
            direction="horizontal"
            spaceBetween="10px"
            className="!mx-16"
          >
            {medias.map((media, index) => (
              <SwiperSlide
                key={index}
                className="!w-min select-none cursor-pointer"
                onClick={() => setActiveMedia(media)}
              >
                <div className="relative w-40 h-[5.625rem] rounded-base overflow-hidden">
                  <Image className="swiper-img" src={media.imageSrc} alt="" fill sizes="100%" unoptimized />

                  {activeMedia === media && (
                    <>
                      <div className="absolute inset-0 border-3 border-[#914913] rounded-base bg-black/30"></div>

                      {activeMedia.videoSrc && (
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10">
                          <Image
                            className="object-contain"
                            src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/minigames/icons/icon_paly_small.png"
                            alt=""
                            fill
                            sizes="100%"
                            unoptimized
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          <div className="navi navi-prev absolute left-[0.5625rem] top-1/2 -translate-y-1/2 w-10 h-12 cursor-pointer transition-transform [&:active]:scale-90">
            <Image
              className="object-contain"
              src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/minigames/icons/icon_previou.png"
              alt=""
              fill
              sizes="100%"
              unoptimized
            />
          </div>

          <div className="navi navi-next absolute right-[0.5625rem] top-1/2 -translate-y-1/2 w-10 h-12 cursor-pointer transition-transform [&:active]:scale-90">
            <Image
              className="object-contain"
              src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/minigames/icons/icon_next.png"
              alt=""
              fill
              sizes="100%"
              unoptimized
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerSwiper;
