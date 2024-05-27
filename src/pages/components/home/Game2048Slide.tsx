import { GAME_URL_2048 } from '@/constant/2048';
import Image from 'next/image';

interface Props {
  needAni?: boolean;
}

export default function Game2048Slide(props: Props) {
  function onExplore() {
    window.open(GAME_URL_2048);
  }

  return (
    <div
      className="bg-entertainment w-full h-screen relative flex justify-center items-center p-12 cursor-pointer"
      onClick={onExplore}
    >
      <Image
        className="object-cover"
        src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/common/2048/cover.png"
        alt=""
        fill
        sizes="100%"
        unoptimized
      />

      <div className="absolute left-0 top-0 w-full h-full bg-black/40"></div>
    </div>
  );
}
