import BasicButton from '@/pages/components/common/BasicButton';
import PageDesc from '@/pages/components/common/PageDesc';
import { createRef, useState, useRef, useEffect } from 'react';
import topBgImg from 'img/nft/trifle/bg_top.png';
import topRightBgImg from 'img/nft/trifle/bg_top_right.png';
import bottomRightBgImg from 'img/nft/trifle/bg_bottom_right.png';
import middleLeftBgImg from 'img/nft/trifle/bg_middle_left.png';
import triangleImg from 'img/nft/trifle/triangle.png';
import Image from 'next/image';
import PrivilegeList from '../PrivilegeList';
import { CSSTransition } from 'react-transition-group';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Mousewheel } from 'swiper/modules';
import PrivilegeModal from '../PrivilegeModal';
import { TrifleCards } from '../constant/card';

export default function PrivilegeScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAniRunning, setIsAniRunning] = useState(false);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const cardsWrapperRef = useRef<HTMLDivElement>(null);
  const [cardContainerHeight, setCardContainerHeight] = useState('auto');
  const cardRefs = Array(TrifleCards.length)
    .fill(null)
    .map(() => createRef<HTMLDivElement>());

  useEffect(() => {
    if (!cardsContainerRef.current) return;
    const height = cardsContainerRef.current.scrollHeight || 0;
    setCardContainerHeight(height > 0 ? `${height}px` : 'auto');
  }, [currentIndex]);

  return (
    <div className="screen-privilege w-full bg-black flex flex-col justify-center items-center pt-[21.3125rem] pb-[17.375rem] relative">
      <div className="bg-box absolute left-0 top-0 w-full h-full">
        <div className="top-box absolute top-0 left-1/2 -translate-x-1/2">
          <Image className="w-[55rem] h-[55rem]" src={topBgImg} alt="" />

          <Image
            className="w-[4.5625rem] h-[4.125rem] absolute top-[14.5625rem] left-1/2 -translate-x-1/2"
            src={triangleImg}
            alt=""
          />
        </div>

        <Image className="w-[18.75rem] h-[18.375rem] absolute top-[5.0625rem] right-0" src={topRightBgImg} alt="" />
        <Image
          className="w-[12.375rem] h-[14.8125rem] absolute bottom-[19.6875rem] right-[14.3125rem]"
          src={bottomRightBgImg}
          alt=""
        />
        <Image
          className="w-[20.375rem] h-[23.875rem] absolute left-0 top-[55.5625rem] -translate-y-1/2"
          src={middleLeftBgImg}
          alt=""
        />
      </div>

      <div className="flex flex-col items-center relative z-0">
        <PageDesc
          title={
            <div className="font-semakin">
              <div className="text-3xl">Previleges of the</div>
              <div className="text-[6.25rem]">Tetra NFT Series</div>
            </div>
          }
          subtitle="We have customized special rewards and benefits for different levels of Tetra NFT owners."
        />

        <div
          ref={cardsWrapperRef}
          className="privileges mt-[16.25rem] transition-[height] ease-in-out duration-500 overflow-hidden shadow-[0_-4rem_4rem_4rem_#000_inset]"
          style={{
            height: cardContainerHeight,
          }}
        >
          <div ref={cardsContainerRef} className="flex justify-center items-center">
            <div className="cards relative w-[22.75rem] h-[27.75rem]">
              {TrifleCards.map(({ isActive, activeImg, inactiveImg }, index) => (
                <CSSTransition
                  in={index >= currentIndex}
                  classNames="card"
                  nodeRef={cardRefs[index]}
                  key={index}
                  timeout={800}
                  unmountOnExit
                  onEnter={() => setIsAniRunning(true)}
                  onExited={() => setIsAniRunning(true)}
                >
                  <div
                    ref={cardRefs[index]}
                    className={`card-level-${index + 1} w-full h-full absolute left-0 top-0 origin-center`}
                  >
                    <Image src={isActive ? activeImg : inactiveImg} alt="" fill />
                  </div>
                </CSSTransition>
              ))}
            </div>

            <div className="pl-[6.25rem] ml-[5.375rem] border-l border-[rgba(246,199,153,0.2)] h-full">
              <div className="title font-semakin text-3xl text-basic-yellow mb-[3.375rem]">
                Privileges of Destiny Tetra
              </div>

              <PrivilegeList step={currentIndex} />
            </div>
          </div>
        </div>

        <div className="font-decima text-base w-[62.5rem] pt-6 pr-[2.375rem] pb-[2.1875rem] pl-[1.9375rem] border border-[#3E3123] rounded-[1.25rem] bg-[rgba(246,199,153,0.06)] text-justify mt-[7.25rem]">
          In the future, if you successfully obtain the upgraded Level Level II-Eternity Tetra NFT or Level III-Infinity
          Tetra NFT, you will receive exponentially increased benefits and unlock more diverse gameplay and rewards.
        </div>

        <div className="flex justify-center items-center gap-2 mt-[4.625rem]">
          <PrivilegeModal />
          <BasicButton label="Get Involved" link="/WhitelistTasks" />
        </div>
      </div>

      <div className="rocket absolute right-0 top-1/2 -translate-y-1/2 font-poppins-medium text-sm mr-[3rem]">
        {TrifleCards.map(({ rocketLevelText, rocketTitle }, index) => (
          <div
            key={index}
            className={[
              'stage [&+.stage]:my-6 cursor-pointer',
              index === currentIndex ? 'text-basic-yellow' : 'text-[rgba(255,255,255,0.4)]',
            ].join(' ')}
            onClick={() => setCurrentIndex(index)}
          >
            <div>{rocketLevelText}</div>
            <div>{rocketTitle}</div>
          </div>
        ))}

        <Swiper
          className="!absolute left-0 top-0 z-10 w-full h-full"
          modules={[Mousewheel]}
          speed={800}
          direction="vertical"
          slidesPerView={1}
          allowTouchMove={false}
          mousewheel={!isAniRunning && { forceToAxis: true }}
          onSlideChange={(swiper) => setCurrentIndex(swiper.realIndex)}
        >
          {TrifleCards.map((_, index) => (
            <SwiperSlide key={index}>
              <div className="w-full h-full"></div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
