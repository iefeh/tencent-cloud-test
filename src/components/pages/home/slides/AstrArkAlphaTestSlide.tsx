import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface Props {
  needAni?: boolean;
}

export default function AstrArkAlphaTestSlide(props: Props) {
  const router = useRouter();

  function onExplore() {
    router.push(`/draw`);
  }

  return (
    <Link
      className="bg-entertainment w-full h-screen relative flex justify-center items-center p-12 cursor-pointer"
      href="/AstrArk/Download"
      target="_self"
    >
      <Image
        className="object-cover"
        src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/home/bg_home_swiper_aa_alpha_test.png"
        alt=""
        fill
        sizes="100%"
        unoptimized
      />
    </Link>
  );
}
