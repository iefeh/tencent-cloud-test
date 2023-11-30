import { Swiper, SwiperSlide } from 'swiper/react';
import banner01Img from 'img/loyalty/earn/banner_01.jpg';
import Image from 'next/image';
import { Pagination } from 'swiper/modules';

export default function HotBanner() {
  const banners = [
    {
      img: banner01Img,
      title: 'AstrArk Character Voice Rally',
      desc: '',
      duration: '2023.11.22~2023.12.10',
      link: '',
    },
    {
      img: banner01Img,
      title: 'AstrArk Character Voice Rally',
      desc: '',
      duration: '2023.11.22~2023.12.10',
      link: '',
    },
  ];

  return (
    <Swiper
      className="w-[57.8125rem] h-[37.5rem] overflow-hidden rounded-[0.625rem] relative"
      modules={[Pagination]}
      slidesPerView={1}
      loop
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
          <Image src={item.img} alt="" fill />

          {item.title && (
            <div className="absolute top-[4.1875rem] left-[3.5625rem] border-l-4 border-basic-yellow z-10 bg-gradient-to-r from-[rgba(0,0,0,0.6)] to-transparent pt-[1.9375rem] pr-[0.875rem] pb-8 pl-[2.5625rem]">
              <div className="font-semakin text-[2.5rem] leading-[3rem] w-[29.1875rem]">{item.title}</div>
              <div className="font-poppins text-base mt-[1.25rem]">{item.duration}</div>
            </div>
          )}
        </SwiperSlide>
      ))}

      <div
        className="basic-swiper-pagination text-white z-10 font-decima flex"
        style={{ left: '3.375rem', bottom: '2.1675rem' }}
      ></div>
    </Swiper>
  );
}
