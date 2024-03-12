import Image from 'next/image';
import myBadgesBgImg from 'img/profile/bg_my_badges.png';
import mbImg from 'img/loyalty/earn/mb.png';
import Link from 'next/link';
import BasicBadge from '@/pages/components/common/badges/BasicBadge';

export default function MyBadges() {
  return (
    <div className="w-[42.5rem] h-[15rem] relative overflow-hidden rounded-[0.625rem] border-1 border-[#1D1D1D] flex flex-col justify-between pt-[2.375rem] pb-[2rem] pr-[2.75rem] pl-[2.5625rem] hover:border-basic-yellow transition-[border-color] duration-500">
      <Image src={myBadgesBgImg} alt="" fill />

      <div className="flex justify-between items-center relative z-0 font-semakin text-basic-yellow">
        <div className="flex items-center">
          <Image className="w-[2.625rem] h-[2.625rem]" src={mbImg} alt="" />
          <span className="text-2xl ml-[0.625rem]">
            My Badges<span className="text-lg ml-[0.5625rem] hidden lg:inline">( 0 )</span>
          </span>
        </div>

        <div className="text-right">
          <Link href="/Profile/MyBadges">More Badges &gt;&gt;</Link>
        </div>
      </div>

      <div className="w-full flex justify-between items-center relative z-0 gap-[1.125rem]">
        <BasicBadge />
        <BasicBadge />
        <BasicBadge />
        <BasicBadge />
        <BasicBadge />
      </div>
    </div>
  );
}
