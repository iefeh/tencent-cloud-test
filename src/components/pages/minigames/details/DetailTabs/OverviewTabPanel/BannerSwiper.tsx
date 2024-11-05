import Video from '@/pages/components/common/Video';
import Image from 'next/image';
import { FC, useEffect, useState } from 'react';
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import styles from './index.module.scss';
import { cn } from '@nextui-org/react';
import { useMGDContext } from '@/store/MiniGameDetails';
import { observer } from 'mobx-react-lite';
import { MiniGames } from '@/types/minigames';

interface MediaItem {
  imageURL: string;
  videoFormat?: string;
  videoURL?: string;
}

const VideoPattern = /\.(mp4|avi|mov|wmv|flv|mkv|webm|m4v)$/i;

const BannerSwiper: FC = () => {
  const { data } = useMGDContext();
  // const medias = (data?.banner || []).map((item) => {
  //   const isVideo = VideoPattern.test(item.url);

  //   const data: MediaItem = {
  //     imageURL: isVideo ? item.thumb! : item.url,
  //   };

  //   if (isVideo) {
  //     data.videoFormat = item.url.match(VideoPattern)?.[1].toLowerCase();
  //     data.videoURL = item.url;
  //   }

  //   return data;
  // });
  const [activeMedia, setActiveMedia] = useState<MiniGames.BannerMedia | null>(null);

  useEffect(() => {
    setActiveMedia(data?.banner?.[0] || null);
  }, [data?.banner]);

  return (
    <div className="bg-[#F7E9CC] px-[1.875rem] py-[2.4375rem] rounded-[1.25rem]">
      <div className="wrapper w-[50rem] max-w-full">
        <div className="relative w-full aspect-[400/225]">
          {activeMedia &&
            (VideoPattern.test(activeMedia.url) ? (
              <Video
                className={cn(['rounded-base overflow-hidden', styles.puffyVideo])}
                options={{
                  sources: [{ src: activeMedia.url, type: `video/${activeMedia.url.match(VideoPattern)?.[1]}` }],
                }}
              />
            ) : (
              <Image
                className="rounded-base object-contain"
                src={activeMedia.url}
                alt=""
                fill
                sizes="100%"
                unoptimized
                priority
              />
            ))}
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
            {(data?.banner || []).map((media, index) => (
              <SwiperSlide
                key={index}
                className="!w-min select-none cursor-pointer"
                onClick={() => setActiveMedia(media)}
              >
                <div className="relative w-40 h-[5.625rem] rounded-base overflow-hidden">
                  <Image className="object-cover" src={media.thumb || media.url} alt="" fill sizes="100%" unoptimized />

                  {activeMedia === media && (
                    <>
                      <div className="absolute inset-0 border-3 border-[#914913] rounded-base bg-black/30"></div>

                      {VideoPattern.test(media.url) && (
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10">
                          <Image
                            className="object-contain"
                            src="https://d3dhz6pjw7pz9d.cloudfront.net/minigames/icons/icon_paly_small.png"
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
              src="https://d3dhz6pjw7pz9d.cloudfront.net/minigames/icons/icon_previou.png"
              alt=""
              fill
              sizes="100%"
              unoptimized
            />
          </div>

          <div className="navi navi-next absolute right-[0.5625rem] top-1/2 -translate-y-1/2 w-10 h-12 cursor-pointer transition-transform [&:active]:scale-90">
            <Image
              className="object-contain"
              src="https://d3dhz6pjw7pz9d.cloudfront.net/minigames/icons/icon_next.png"
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

export default observer(BannerSwiper);
