import { Swiper, SwiperClass, SwiperSlide } from 'swiper/react';
import { MousewheelOptions } from 'swiper/types';
import { Mousewheel } from 'swiper/modules';

interface Props {
  count: number;
  mousewheel?: MousewheelOptions | boolean;
  onSwiperInit?: (swiper: SwiperClass) => void;
  onActiveIndexChange?: (swiper: SwiperClass) => void;
}

export default function SchoolSwiper(props: Props) {
  const { count, mousewheel, onSwiperInit, onActiveIndexChange } = props;

  return (
    <div className="absolute left-0 top-0 w-full h-screen overflow-hidden z-10" onWheel={(e) => e.stopPropagation()}>
      <Swiper
        modules={[Mousewheel]}
        slidesPerView={1}
        speed={0}
        mousewheel={mousewheel}
        direction="horizontal"
        onInit={onSwiperInit}
        onActiveIndexChange={onActiveIndexChange}
      >
        {Array(count)
          .fill(null)
          .map((_, index) => (
            <SwiperSlide key={index}>
              <div className="w-screen h-screen"></div>
            </SwiperSlide>
          ))}
      </Swiper>
    </div>
  );
}
