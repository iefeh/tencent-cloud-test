import Image from 'next/image';
import triangleImg from 'img/loyalty/intro/triangle.png';
import triangleLightImg from 'img/loyalty/intro/triangle_light.png';
import journeyDefaultImg from 'img/loyalty/intro/journey_default.png';
import journeyHLImg from 'img/loyalty/intro/journey_highlight_left.png';
import journeyHRImg from 'img/loyalty/intro/journey_highlight_right.png';
import PageDesc from '@/pages/components/common/PageDesc';
import { MouseEventHandler, useRef, useState } from 'react';

export default function JourneyScreen() {
  const journeyWrapperRef = useRef<HTMLDivElement>(null);
  const [journeyImg, setJourneyImg] = useState(journeyDefaultImg);

  const onJourneyMouseMove: MouseEventHandler<HTMLDivElement> = (e) => {
    const {
      nativeEvent: { offsetX },
    } = e;
    const width = journeyWrapperRef.current?.offsetWidth || 0;
    if (!width) {
      setJourneyImg(journeyDefaultImg);
      return;
    }

    const xp = offsetX / width;
    const leftMin = 173 / 1400;
    const leftMax = 935 / 1400;
    const rightMin = 989 / 1400;
    const rightMax = 1271 / 1400;

    // 左边界线
    if (xp >= leftMin && xp <= leftMax) {
      setJourneyImg(journeyHLImg);
    } else if (xp >= rightMin && xp <= rightMax) {
      setJourneyImg(journeyHRImg);
    } else {
      setJourneyImg(journeyDefaultImg);
    }
  };

  const onJourneyMouseLeave: MouseEventHandler<HTMLDivElement> = (e) => {
    setJourneyImg(journeyDefaultImg);
  };

  return (
    <div className="w-full flex flex-col justify-center items-center relative">
      <div className="relative w-[44.75rem] h-[41.9375rem]">
        <Image
          className="absolute left-1/2 top-[-12rem] -translate-x-1/2 z-0 max-w-[55.0625rem] w-[55.0625rem] h-[55.0625rem]"
          src={triangleLightImg}
          alt=""
        />

        <Image src={triangleImg} alt="" fill />

        <div className="absolute left-1/2 bottom-[15.375rem] -translate-x-1/2 w-max z-10">
          <PageDesc
            className="flex flex-col justify-center items-center text-center"
            needAni
            baseAniTY
            title={
              <div className="font-semakin text-6xl">
                <span className="text-basic-yellow">More Surprises</span>
                <span> Coming Soon...</span>
              </div>
            }
            subtitle={
              <span className="mt-[3rem] font-decima text-lg text-center max-w-[45.625rem]">
                The full-fledged Moonveil Loyalty Program of the future will consist of three phases. All players can
                exchange their accumulated Moon Beams for substantial rewards soon.
              </span>
            }
          />
        </div>
      </div>

      <div
        ref={journeyWrapperRef}
        className="w-[87.5rem] h-[58.8125rem] relative mb-[12.5625rem] -translate-y-[8.4375rem]"
        onMouseMove={onJourneyMouseMove}
        onMouseLeave={onJourneyMouseLeave}
      >
        <Image src={journeyImg} alt="" fill />
      </div>
    </div>
  );
}
