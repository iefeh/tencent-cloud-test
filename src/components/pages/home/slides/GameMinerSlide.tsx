import { GAME_URL_2048 } from '@/constant/2048';
import { MinigameID } from '@/constant/minigames';
import Image from 'next/image';
import { useRouter } from 'next/router';

interface Props {
  needAni?: boolean;
}

export default function GameMinerSlide(props: Props) {
  const router = useRouter();

  function onExplore() {
    router.push(`/minigames/details/${MinigameID.PUFFY_MINER}`)
  }

  return (
    <div
      className="bg-entertainment w-full h-screen relative flex justify-center items-center p-12 cursor-pointer"
      onClick={onExplore}
    >
      <Image
        className="object-cover"
        src="https://d3dhz6pjw7pz9d.cloudfront.net/game/goldminer/miner-2024-12-17-banner.png"
        alt=""
        fill
        sizes="100%"
        unoptimized
      />
    </div>
  );
}
