import { Swiper, SwiperSlide } from 'swiper/react';
import banner01Img from 'img/loyalty/earn/banner_01.jpg';
import Image from 'next/image';
import { Autoplay, Pagination } from 'swiper/modules';
import { TaskAdItem, taskAdListAPI } from '@/http/services/task';
import { useEffect, useState } from 'react';
import CircularLoading from '@/pages/components/common/CircularLoading';

export default function HotBanner() {
  const [banners, setBanners] = useState<TaskAdItem[]>([]);
  const [loading, setLoading] = useState(false);

  async function queryAd() {
    setLoading(true);

    try {
      const res = await taskAdListAPI();
      const list = res || [];
      if (list.length < 1) {
        list.push({
          image_url: '/img/loyalty/earn/banner_02.png',
          link_url: 'https://discord.gg/moonveil',
          title: 'Join Discord for AstrArk School Cup',
          description:
            'From Jan 16 to Jan 28<br />Reward: Guaranteed TETRA Whitelist Spots*5 + FCFS TETRA Whitelist Spots*8',
        });
      }

      setBanners(res || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  function onSlideClick(item: TaskAdItem) {
    window.open(item.link_url, '_blank');
  }

  useEffect(() => {
    queryAd();
  }, []);

  return (
    <div className="relative w-[57.8125rem] h-[37.5rem] hidden lg:block">
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
          <SwiperSlide key={index} className="relative cursor-pointer" onClick={() => onSlideClick(item)}>
            <Image className='object-cover' src={item.image_url} alt="" fill />

            {item.title && (
              <div className="absolute top-[4.1875rem] left-[3.5625rem] border-l-4 border-basic-yellow z-10 bg-gradient-to-r from-[rgba(0,0,0,0.6)] to-transparent pt-[1.9375rem] pr-[0.875rem] pb-8 pl-[2.5625rem]">
                <div className="font-semakin text-[2.5rem] leading-[3rem] w-[31rem]">{item.title}</div>
                <div
                  className="font-poppins text-base mt-[1.25rem]"
                  dangerouslySetInnerHTML={{ __html: item.description }}
                ></div>
              </div>
            )}
          </SwiperSlide>
        ))}

        <div
          className="basic-swiper-pagination text-white z-10 font-decima flex"
          style={{ left: '3.375rem', bottom: '2.1675rem' }}
        ></div>
      </Swiper>

      {loading && <CircularLoading />}
    </div>
  );
}
