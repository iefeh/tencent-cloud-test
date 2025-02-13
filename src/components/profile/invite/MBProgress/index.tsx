import CircularLoading from '@/pages/components/common/CircularLoading';
import { FC, useEffect, useRef, useState } from 'react';
import { Swiper, SwiperSlide, SwiperClass } from 'swiper/react';
import { FreeMode, Navigation } from 'swiper/modules';
import { cn } from '@nextui-org/react';
import 'swiper/css';
import 'swiper/css/free-mode';
import styles from './index.module.css';
import { useInviteStore } from '@/store/Invite';
import { observer } from 'mobx-react-lite';
import arrowImg from 'img/astrark/arrow.png';
import S3Image from '@/components/common/medias/S3Image';

const MBProgress: FC = () => {
  const { milestone, loading } = useInviteStore();
  let { diplomat, successful_direct_invitee: currentInvited = 0 } = milestone || {};
  const [inProgressIndex, setInProgressIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const swiperRef = useRef<SwiperClass | null>(null);
  const navigationPrevRef = useRef(null);
  const navigationNextRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let rate = 0;

    if (!diplomat || diplomat.series.length < 1) {
      setInProgressIndex(-1);
    } else {
      const { series } = diplomat;
      const index = series.findIndex((item) => (item.milestone || 0) > currentInvited);
      setInProgressIndex(index);

      if (index < 0) {
        rate = 1;
      } else {
        const targetInvitees = series[index].milestone || 0;
        const lastInvitees = series[index - 1]?.milestone || 0;
        const period = (currentInvited - lastInvitees) / (targetInvitees - lastInvitees);
        rate = Math.min(Math.max((index + period) / series.length, 0), 1);
      }
    }

    containerRef.current.style.setProperty(
      '--progress',
      `calc(${(rate * 100).toFixed(2)}% - ${Math.max(18 * rate, 12)}rem)`,
    );
  }, [currentInvited, diplomat]);

  useEffect(() => {
    if (!swiperRef.current) return;

    swiperRef.current.slideTo(inProgressIndex, 0);
  }, [inProgressIndex]);

  return (
    <div className="mt-16 w-full">
      <div className="text-base">
        In addition to 30 Moon Beams for each successful direct invite, reaching milestones will earn you up to an extra
        3300+ bonus Moon beams.
      </div>

      <div className="font-semakin text-2xl mt-2">
        A total of{' '}
        <span className="text-basic-yellow">{(milestone?.total_reward || 0).toLocaleString('en-US')} Moon Beams</span>{' '}
        were received from our Referral Program now.
      </div>

      <div ref={containerRef} className="w-full h-60 relative">
        {(diplomat?.series?.length || 0) > 0 ? (
          <Swiper
            className={cn(['relative !px-12', styles.progressSwiper])}
            modules={[FreeMode, Navigation]}
            freeMode={true}
            slidesPerView="auto"
            spaceBetween="4.5rem"
            navigation={{
              prevEl: navigationPrevRef.current,
              nextEl: navigationNextRef.current,
            }}
            onInit={(swiper) => (swiperRef.current = swiper)}
          >
            {diplomat!.series.map((item, index) => (
              <SwiperSlide key={index} className="!h-auto">
                <div className="flex flex-col items-center max-w-[6rem]">
                  <div className="w-24 h-24 relative">
                    <S3Image className="object-contain bg-black" src={item.image_url} fill />
                  </div>

                  <div className="uppercase text-basic-yellow font-semakin text-lg mt-4 flex-1 text-center">
                    {index === 0 ? diplomat!.name || '--' : `+${item.reward_moon_beam} mb`}
                  </div>

                  <div
                    className={cn([
                      'text-base mt-7',
                      index < inProgressIndex
                        ? 'text-[#666]'
                        : index === inProgressIndex
                        ? 'text-basic-yellow'
                        : 'text-white',
                    ])}
                  >
                    {index < inProgressIndex
                      ? 'Completed'
                      : index === inProgressIndex
                      ? 'In Progress'
                      : `${item.milestone || '--'} invitees`}
                  </div>
                </div>
              </SwiperSlide>
            ))}

            <div
              ref={navigationPrevRef}
              className="absolute left-0 top-1/2 -translate-y-1/2 rotate-90 cursor-pointer z-10 w-[3.125rem] h-7 [&.swiper-button-disabled]:grayscale"
            >
              <S3Image src={arrowImg} fill />
            </div>

            <div
              ref={navigationNextRef}
              className="absolute right-0 top-1/2 -translate-y-1/2 -rotate-90 cursor-pointer z-10 w-[3.125rem] h-7"
            >
              <S3Image src={arrowImg} fill />
            </div>
          </Swiper>
        ) : (
          <div className="h-full flex flex-col py-2 items-center justify-center text-xl">
            <p className="shrink-0">More exciting rewards coming soon.</p>
            <p className="shrink-0">Stay tuned!</p>
          </div>
        )}

        {loading && <CircularLoading />}
      </div>
    </div>
  );
};

export default observer(MBProgress);
