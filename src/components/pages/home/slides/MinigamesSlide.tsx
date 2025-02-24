import Image from 'next/image';
import { useRouter } from 'next/router';

interface Props {
  needAni?: boolean;
}

export default function MinigamesSlide(props: Props) {
  const router = useRouter();

  function onExplore() {
    router.push(`/minigames`);
  }

  return (
    <div
      className="bg-entertainment w-full h-screen relative flex justify-center items-center p-12 cursor-pointer"
      onClick={onExplore}
    >
      <Image
        className="object-cover"
        src="https://cdn.moonveil.gg/home/bg_home_swiper_minigames.png"
        alt=""
        fill
        sizes="100%"
        unoptimized
      />
    </div>
  );
}
