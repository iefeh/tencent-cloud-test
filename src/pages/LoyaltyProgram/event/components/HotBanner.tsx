import { Swiper, SwiperSlide } from 'swiper/react';
import Image from 'next/image';
import { Autoplay, Pagination } from 'swiper/modules';
import { FullEventItem } from '@/http/services/task';

interface Props {
  item: FullEventItem;
}

export default function HotBanner(props: Props) {
  const { item } = props;
  const banners = [item.image_url];

  return (
    <div className="relative w-[57.8125rem] lg:h-[37.5rem] max-w-full h-72">
      <Swiper
        className="w-full h-full overflow-hidden rounded-[0.625rem] relative"
        modules={[Pagination, Autoplay]}
        slidesPerView={1}
        loop
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        speed={2000}
        pagination={{
          el: '.basic-swiper-pagination',
          bulletClass: 'pagi',
          bulletActiveClass: 'pagi-active',
          type: 'bullets',
          clickable: true,
          renderBullet(index, className) {
            return `<span class="${className}">${(index + 1 + '').padStart(2, '0')}</span>`;
          },
        }}
      >
        {banners.map((item, index) => (
          <SwiperSlide key={index} className="relative">
            <Image className="object-cover" src={item} alt="" fill sizes="100%" />
          </SwiperSlide>
        ))}

        <div
          className="basic-swiper-pagination text-white z-10 font-decima flex"
          style={{ left: '3.375rem', bottom: '2.1675rem' }}
        ></div>
      </Swiper>
    </div>
  );
}
