import PageDesc from '@/components/common/PageDesc';
import Image from 'next/image';
import Video from '@/pages/components/common/Video';
import { Swiper, SwiperClass, SwiperSlide } from 'swiper/react';
import { cn } from '@nextui-org/react';
import { FreeMode, Navigation, Thumbs } from 'swiper/modules';
import { useState } from 'react';
import S3Image from '@/components/common/medias/S3Image';

export default function GameContent() {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperClass | null>(null);
  const [realIndex, setRealIndex] = useState(0);
  const videos = [
    {
      thumb: '/bushwhack/background/thumbs/Bushwhack+Teaser.png',
      src: 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/bushwhack/background/teaser.mp4',
      type: 'video/mp4',
    },
    {
      thumb: '/bushwhack/background/thumbs/Character+Showcase.png',
      src: 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/bushwhack/background/Character+Showcase.mp4',
      type: 'video/mp4',
    },
    {
      thumb: '/bushwhack/background/thumbs/Different+Items+utility.png',
      src: 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/bushwhack/background/Different+Items+utility.mp4',
      type: 'video/mp4',
    },
    {
      thumb: '/bushwhack/background/thumbs/HOW+TO+USE+KAYA+WIN.png',
      src: 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/bushwhack/background/HOW+TO+USE+KAYA+WIN.mp4',
      type: 'video/mp4',
    },
    {
      thumb: '/bushwhack/background/thumbs/Risk+Attention.png',
      src: 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/bushwhack/background/Risk+Attention.mp4',
      type: 'video/mp4',
    },
  ];

  return (
    <div className="w-full relative z-30 shadow-[0_0_2rem_2rem_#000]">
      <Image className="object-cover" src="/img/bushwhack/content/bg.jpg" alt="" fill />

      <main className="max-w-full px-16 lg:px-0 lg:max-w-[75rem] m-auto flex flex-col pt-16 lg:pt-[26.625rem] pb-[13.625rem] relative z-0">
        <PageDesc
          hasBelt
          className="items-start text-left"
          title={
            <div className="font-semakin text-6xl" style={{ textShadow: '0 0 2rem #3C6EFF' }}>
              BUSHWHACK
              <br />
              ——STEALTH BATTLE ROYALE
            </div>
          }
          subtitle={
            <div className="text-lg font-decima tracking-tighter mt-10">
              Step into our mysterious, mist-covered battlefield! Players engage in a fierce battle, and only the last
              one standing emerges victorious. Survival demands mastering the art of stealth – hide in the mist, waiting
              for the perfect moment to ambush opponents. Collect resources, upgrade gear, and be ready to escape danger
              circles tightening the battlefield. BUSHWHACK will also collaborate with renowned brands or NFTs in future
              events. Stay tuned for more updates
            </div>
          }
        />

        <Swiper
          className="w-full aspect-[16/9] mt-8 rounded-base overflow-hidden"
          modules={[Thumbs, FreeMode, Navigation]}
          loop={true}
          spaceBetween={10}
          navigation={true}
          thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
          onRealIndexChange={(swiper) => setRealIndex(swiper.realIndex)}
        >
          {videos.map((video, index) => (
            <SwiperSlide key={index} className="pointer-events-auto">
              <Video
                className="w-full h-auto"
                options={{
                  autoplay: false,
                  muted: false,
                  controls: true,
                  sources: [video],
                }}
              />
            </SwiperSlide>
          ))}
        </Swiper>

        <Swiper
          className="w-full h-16 md:h-48 mt-8"
          modules={[Thumbs, FreeMode, Navigation]}
          spaceBetween={10}
          slidesPerView={4}
          freeMode={true}
          watchSlidesProgress
          onSwiper={setThumbsSwiper}
        >
          {videos.map((video, index) => (
            <SwiperSlide
              key={index}
              className={cn([
                'relative rounded-base overflow-hidden border-1 cursor-pointer video-js',
                index === realIndex ? 'border-white/80' : 'border-white/10',
              ])}
            >
              <S3Image className={cn(['w-full h-full object-cover'])} src={video.thumb} />

              {index === realIndex && (
                <>
                  <div className="absolute inset-0 bg-black/50"></div>

                  <button
                    className="vjs-big-play-button !bg-[#2b333f]/70 scale-[0.4] md:scale-100"
                    type="button"
                    title="Play Video"
                    aria-disabled="true"
                  >
                    <span className="vjs-icon-placeholder" aria-hidden="true"></span>
                    <span className="vjs-control-text" aria-live="polite">
                      Play Video
                    </span>
                  </button>
                </>
              )}
            </SwiperSlide>
          ))}
        </Swiper>

        {/* <PageDesc
          className="items-start text-left mt-14"
          title={
            <div className="font-semakin text-6xl" style={{ textShadow: '0 0 2rem #3C6EFF' }}>
              Game testing
            </div>
          }
          subtitle={
            <div className="text-lg font-decima tracking-tighter mt-12">
              Step into our mysterious, mist-covered battlefield! Players engage in a fierce battle, and only the last
              one standing emerges victorious. Survival demands mastering the art of stealth – hide in the mist, waiting
              for the perfect moment to ambush opponents. Collect resources, upgrade gear, and be ready to escape danger
              circles tightening the battlefield.
            </div>
          }
        /> */}
      </main>
    </div>
  );
}
