import S3Image from '@/components/common/medias/S3Image';
import Link from 'next/link';

interface Props {
  needAni?: boolean;
}

export default function AstrArkMarchingTestSlide(props: Props) {
  return (
    <Link
      className="bg-entertainment w-full h-screen relative flex justify-center items-center p-12 cursor-pointer"
      href="/LoyaltyProgram/earn?tabKey=AstrArk"
      target="_self"
    >
      <S3Image className="object-cover" src="/home/bg_home_swiper_aa_marching_test.png" fill />
    </Link>
  );
}
