import PageDesc from '@/pages/components/common/PageDesc';
import ScrollDownArrow from '@/pages/components/common/ScrollDownArrow';
import Image from 'next/image';
import bgImg from 'img/loyalty/intro/bg_home.jpg';
import smallTriangleImg from 'img/loyalty/intro/triangle_small.png';
import bigTriangleImg from 'img/loyalty/intro/triangle_big.png';

export default function IndexScreen() {
  return (
    <div className="w-full h-screen flex justify-center items-center relative">
      <Image className="object-cover" src={bgImg} alt="" fill />

      <Image className="absolute top-[22.5%] left-[22.34%] w-[3.4375rem] h-[3.5rem]" src={smallTriangleImg} alt="" />

      <Image className="absolute top-[55%] left-[67.97%] w-[9.5625rem] h-[5.875rem]" src={bigTriangleImg} alt="" />

      <PageDesc
        title="moonveil loyalty system"
        hasBelt
        needAni
        baseAniTY
        subtitle={
          <div className="max-w-[32.0625rem] font-decima text-lg">
            At Moonveil, player experience is of paramount importance. We are dedicated to recognizing and rewarding
            players&#39; contributions in our ecosystem by introducing the Moonveil Loyalty Program, centered around
            Moonveil Beam (MB) points.
          </div>
        }
      />

      <ScrollDownArrow />
    </div>
  );
}
