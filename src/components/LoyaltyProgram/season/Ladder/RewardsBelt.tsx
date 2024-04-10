import { BattlePassRewardDTO } from '@/http/services/battlepass';
import { cn } from '@nextui-org/react';
import Image from 'next/image';
import { FC, useRef } from 'react';
import { FreeMode, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import arrowImg from 'img/astrark/arrow.png';

interface Props extends ClassNameProps {
  items?: BattlePassRewardDTO[];
}

const RewardsBelt: FC<Props> = ({ className, items = [] }) => {
  const navigationPrevRef = useRef(null);
  const navigationNextRef = useRef(null);

  return (
    <Swiper
      className={cn(['!px-[3.125rem]', className])}
      modules={[Navigation, FreeMode]}
      slidesPerView="auto"
      freeMode={true}
      spaceBetween="1rem"
      navigation={{
        prevEl: navigationPrevRef.current,
        nextEl: navigationNextRef.current,
      }}
    >
      {items.map((item, index) => {
        const prop = item.properties as any;
        const img = prop.image_url;
        const text = prop.name || '--';

        return (
          <SwiperSlide key={index} className="!w-max [&+.swiper-slide]:ml-4">
            <div className="flex flex-col items-center w-min text-center">
              <div className="relative w-[5.625rem] h-[5.625rem]">
                {img && <Image className="object-contain scale-50 origin-center" src={img} alt="" fill sizes="100%" />}

                <div className="absolute right-2 bottom-2 text-basic-yellow text-sm">x{prop.amount || 0}</div>
              </div>

              <div className="w-full line-clamp-3 text-[#999999] mt-ten">{text}</div>
            </div>
          </SwiperSlide>
        );
      })}

      <div
        ref={navigationPrevRef}
        className="absolute left-0 top-[2.8125rem] -translate-y-1/2 rotate-90 cursor-pointer z-10"
      >
        <Image className="w-[3.125rem] h-7" src={arrowImg} alt="" />
      </div>

      <div
        ref={navigationNextRef}
        className="absolute right-0 top-[2.8125rem] -translate-y-1/2 -rotate-90 cursor-pointer z-10"
      >
        <Image className="w-[3.125rem] h-7" src={arrowImg} alt="" />
      </div>
    </Swiper>
  );
};

export default RewardsBelt;
