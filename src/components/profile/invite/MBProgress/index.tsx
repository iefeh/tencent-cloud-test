import CircularLoading from '@/pages/components/common/CircularLoading';
import Image from 'next/image';
import { FC, useEffect, useRef, useState } from 'react';
import { Swiper, SwiperSlide, SwiperClass } from 'swiper/react';
import mbImg from 'img/profile/invite/mb.png';
import { FreeMode } from 'swiper/modules';
import { Tooltip, cn } from '@nextui-org/react';
import 'swiper/css';
import 'swiper/css/free-mode';
import styles from './index.module.css';

interface InviteProgressNode {
  mb: number;
  invitees: number;
}

const MBProgress: FC = () => {
  const [currentInvitees, setCurrentInvitees] = useState(7);
  const [progress, setProgress] = useState<InviteProgressNode[]>([
    {
      mb: 5,
      invitees: 1,
    },
    {
      mb: 5,
      invitees: 2,
    },
    {
      mb: 5,
      invitees: 3,
    },
    {
      mb: 5,
      invitees: 4,
    },
    {
      mb: 5,
      invitees: 5,
    },
    {
      mb: 5,
      invitees: 6,
    },
    {
      mb: 5,
      invitees: 10,
    },
    {
      mb: 5,
      invitees: 15,
    },
    {
      mb: 5,
      invitees: 20,
    },
    {
      mb: 5,
      invitees: 30,
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [inProgressIndex, setInProgressIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const swiperRef = useRef<SwiperClass | null>(null);

  useEffect(() => {
    const index = progress.findIndex((item) => item.invitees > currentInvitees);
    setInProgressIndex(index);
    if (!containerRef.current) return;

    let rate = 0;
    if (progress.length > 0) {
      if (index < -1) {
        rate = 1;
      } else {
        const targetInvitees = progress[index].invitees || 0;
        const lastInvitees = progress[index - 1]?.invitees || 0;
        const period = (currentInvitees - lastInvitees) / (targetInvitees - lastInvitees);
        rate = Math.min(Math.max((index + period) / progress.length, 0), 1);
      }
    }
    containerRef.current.style.setProperty(
      '--progress',
      `calc(${(rate * 100).toFixed(2)}% - ${Math.max(6 * rate, 3)}rem)`,
    );
  }, [currentInvitees, progress]);

  useEffect(() => {
    if (!swiperRef.current) return;

    swiperRef.current.slideTo(inProgressIndex, 0);
  }, [inProgressIndex]);

  return (
    <div className="mt-16 w-full">
      <div className="font-semakin text-2xl">
        Continue inviting to earn an additional <span className="text-basic-yellow">1,000+ points</span>
      </div>

      <div ref={containerRef} className="w-full h-60 relative px-12">
        {progress.length > 0 ? (
          <Swiper
            className={cn(['relative', styles.progressSwiper])}
            modules={[FreeMode]}
            freeMode={true}
            slidesPerView="auto"
            spaceBetween="4.5rem"
            onInit={(swiper) => (swiperRef.current = swiper)}
          >
            {progress.map((item, index) => (
              <SwiperSlide key={index}>
                <Tooltip content={`${item.invitees} invitees`}>
                  <div className="flex flex-col items-center">
                    <Image className="w-[2.875rem] h-[2.875rem] object-contain" src={mbImg} alt="" sizes="100%" />

                    <div className="uppercase text-basic-yellow font-semakin text-lg mt-4">+{item.mb}mb</div>

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
                        : `${item.invitees} invitees`}
                    </div>
                  </div>
                </Tooltip>
              </SwiperSlide>
            ))}
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

export default MBProgress;
