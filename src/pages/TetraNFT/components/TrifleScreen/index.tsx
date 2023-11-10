import BasicButton from '@/pages/components/common/BasicButton';
import PageDesc from '@/pages/components/common/PageDesc';
import Image from 'next/image';
import inactiveTrifleImg from 'img/nft/trifle/trifle_inactive.jpg';
import activeTrifleImg1 from 'img/nft/trifle/trifle_active_1.jpg';
import arrowImg from 'img/nft/trifle/arrow.png';
import trifleBgImg1 from 'img/nft/trifle/trifle_bg_1.png';
import trifleBgImg2 from 'img/nft/trifle/trifle_bg_2.png';
import activeLabelImg from 'img/nft/trifle/label_active.png';
import inactiveLabelImg from 'img/nft/trifle/label_inactive.png';
import { Fragment, useRef } from 'react';
import useLuxyScroll from '@/hooks/luxyScroll';

export default function TrifleScren() {
  const trifles = [
    {
      title: 'Destiny Tetra',
      label: 'Level I',
      activeImg: activeTrifleImg1,
      bgImg: trifleBgImg1,
      bgStyle: { maxWidth: '109%', width: '109%', height: '109%' },
      videoSrc: '/video/ntfbg.webm',
      isActive: true,
    },
    {
      title: 'Eternity Tetra',
      label: 'Level II',
      // TODO 替换二阶激活图片
      activeImg: activeTrifleImg1,
      bgImg: trifleBgImg2,
      bgStyle: { maxWidth: '103%', width: '103%', height: '103%' },
      isActive: false,
    },
    {
      title: 'Infinity Tetra',
      label: 'Level III',
      // TODO 替换三阶激活图片
      activeImg: activeTrifleImg1,
      isActive: false,
    },
  ];
  const descRef = useRef<HTMLDivElement>(null);
  const { visible } = useLuxyScroll(descRef);

  return (
    <div
      ref={descRef}
      className="w-full bg-black flex flex-col justify-center items-center shadow-[0_-2rem_4rem_4rem_#000] pt-[9.0625rem]"
    >
      <PageDesc
        needAni={visible}
        baseAniTY
        title="Collect, Sythesize and Upgrade"
        subtitle={
          <>
            <div className="w-[54rem] font-decima text-lg">
              Our creative gameplay of Tetra NFT Series is to collect, synthesize and upgrade. A higher level of Tetra
              NFT ownership means more rights, rewards, and influence in our ecosystem, and also means greater
              responsibilities to our community.
            </div>
            <div className="font-semakin text-basic-yellow text-[1.75rem] mt-24 leading-[1]">
              We have three levels of Tetra NFTs
            </div>

            <div className="px-10 py-4 border border-[#3E3123] rounded-[0.625rem] bg-[rgba(246,199,153,0.06)] mt-[1.875rem] font-decima text-base">
              Collect multiple Level I Destiny Tetra NFTs to synthesize and upgrade to higher level NFTs.
            </div>
          </>
        }
      />

      <div className="mystery-box-list flex justify-between items-center mt-[6.625rem]">
        {trifles.map((item, index) => {
          return (
            <Fragment key={index}>
              {index > 0 && <Image className="w-7 h-[3.1875rem] mx-[2.75rem]" src={arrowImg} alt="" />}

              <div className="mystery-box relative">
                {item.bgImg && (
                  <Image className="absolute bottom-2 right-2 z-0" style={item.bgStyle} src={item.bgImg} alt="" />
                )}

                <div
                  className={
                    'box relative z-0 border rounded-[1.25rem] ' +
                    (item.isActive ? 'border-[rgba(75,217,214,0.6)]' : 'border-[rgba(255,255,255,0.5)]')
                  }
                >
                  <Image
                    className={
                      'w-[18.75rem] h-[18.75rem] rounded-[1.25rem] relative z-10 cursor-pointer transition-opacity ' +
                      (item.isActive ? 'hover:opacity-0' : '')
                    }
                    src={item.isActive ? item.activeImg : inactiveTrifleImg}
                    alt=""
                  />

                  {/* TODO 优化失焦后重置进度 */}
                  {item.isActive && item.videoSrc && (
                    <video
                      className="object-cover w-full h-full absolute left-0 top-0 z-0 rounded-[1.25rem] cursor-pointer"
                      autoPlay
                      playsInline
                      muted
                      loop
                      preload="auto"
                    >
                      <source src={item.videoSrc} />
                    </video>
                  )}

                  <span className="absolute left-1/2 -bottom-8 -translate-x-1/2 translate-y-full font-semakin text-lg text-[#333] uppercase">
                    {item.label}
                  </span>

                  <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 w-[8.8125rem] h-6 text-center z-10">
                    <Image src={item.isActive ? activeLabelImg : inactiveLabelImg} alt="" fill />
                    <span
                      className={
                        'relative z-0 font-decima text-sm ' +
                        (item.isActive ? 'text-[#4BD9D6]' : 'text-[rgba(255,255,255,0.5)]')
                      }
                    >
                      {item.title}
                    </span>
                  </div>
                </div>
              </div>
            </Fragment>
          );
        })}
      </div>

      <BasicButton className="mt-[8.1875rem]" label="Get Involved" />
    </div>
  );
}
