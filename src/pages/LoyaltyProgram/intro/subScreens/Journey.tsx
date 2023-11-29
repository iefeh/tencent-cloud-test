import Image from 'next/image';
import triangleImg from 'img/loyalty/intro/triangle.png';
import triangleLightImg from 'img/loyalty/intro/triangle_light.png';
import journeyDefaultImg from 'img/loyalty/intro/journey_default.png';
import PageDesc from '@/pages/components/common/PageDesc';

export default function JourneyScreen() {
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
                The full-fledged Moonveil Loyalty Program of the future will consist of three phases. Phase I activities
                are now live. Phase II and Phase III will soon be announced, and all players can exchange their
                accumulated Moon Beams for substantial rewards, including cash rebates based on player’s ecosystem
                contribution.
              </span>
            }
          />
        </div>
      </div>

      <Image className="mb-[12.5625rem] -translate-y-[8.4375rem]" src={journeyDefaultImg} alt="" />
    </div>
  );
}
