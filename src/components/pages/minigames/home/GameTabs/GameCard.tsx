import StrokeButton from '@/components/common/buttons/StrokeButton';
import { GameStatus } from '@/constant/minigames';
import type { MiniGames } from '@/types/minigames';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

interface Props {
  item: MiniGames.GameItem;
}

const StatusConfig: Dict<{ label: string; color: string }> = {
  [GameStatus.IN_PROGRESS]: {
    label: 'In Progress',
    color: '#F6C799',
  },
  [GameStatus.COMING_SOON]: {
    label: 'Coming Soon',
    color: '#4FDCFF',
  },
  [GameStatus.WAIT_FOR_NEXT_ROUND]: {
    label: 'Completed',
    color: '#fff',
  },
};

const GameCard: FC<Props> = ({ item: { ticket, img_url, client_id, status, icon_url, client_name } }) => {
  const { label, color } = StatusConfig[status] || {};
  const canPlay = status === GameStatus.IN_PROGRESS;

  return (
    <div className="px-6 py-7 bg-[#F7E9CC] border-2 border-basic-gray rounded-base">
      <div className="relative w-[25rem] h-[11.25rem] rounded-base overflow-hidden">
        <Image className="object-cover" src={img_url} alt="" fill sizes="100%" unoptimized priority />

        <div
          className="absolute left-0 top-2 w-[7.625rem] h-9 bg-black/50 rounded-r-lg leading-9 text-center"
          style={{ color: color || '#fff' }}
        >
          {label || status}
        </div>
      </div>

      <div className="flex gap-x-5 items-center mt-5">
        <div className="relative w-[5.75rem] aspect-square flex-shrink-0">
          <Image className="object-cover rounded-base" src={icon_url} alt="" fill sizes="100%" unoptimized priority />
        </div>

        <div className="mt-[0.1875rem]">
          <div className="text-xl leading-6">{client_name}</div>

          <p className="mt-4 font-jcyt4 text-sm leading-6">
            Our test server will open at 4:00 pm, Nov. 16th, Singapore time...
          </p>
        </div>
      </div>

      <div className="mt-8 flex justify-between items-center">
        <Link href={canPlay ? `/minigames/details/${client_id}` : 'javascript:;'} target={canPlay ? '_blank' : '_self'}>
          <StrokeButton className="w-[12.75rem]" strokeType="yellow" strokeText="Play Now" isDisabled={!canPlay} />
        </Link>

        <StrokeButton
          className="w-[9.0625rem] text-yellow-1 p-0 pl-11 pt-[0.875rem] cursor-default"
          strokeType="ticket"
          strokeText={ticket?.remain?.toString() || '-'}
          startContent={
            <span className="absolute top-0 right-2 text-sm leading-none text-brown font-jcyt4">Your Tickets</span>
          }
        />
      </div>
    </div>
  );
};

export default GameCard;
