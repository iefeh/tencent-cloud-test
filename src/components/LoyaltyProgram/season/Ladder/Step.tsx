import { BattlePassLevelDTO } from '@/http/services/battlepass';
import { FC } from 'react';
import Reward from './Reward';
import { cn } from '@nextui-org/react';
import Image from 'next/image';
import lockedLevelNodeImg from 'img/loyalty/season/level_node_locked.png';
import acheviedLevelNodeImg from 'img/loyalty/season/level_node_achevied.png';

interface Props {
  className?: string;
  isFinal?: boolean;
  standardItem?: BattlePassLevelDTO;
  premiumItem?: BattlePassLevelDTO;
  onItemClick?: (item?: BattlePassLevelDTO) => void;
}

const Step: FC<Props> = ({ className, isFinal, standardItem, premiumItem, onItemClick }) => {
  const isNodeAchevied = !!standardItem?.satisfied_time || !!premiumItem?.satisfied_time;

  return (
    <div className={cn(['flex justify-between items-center', className])}>
      {isFinal || (
        <>
          <Reward item={premiumItem} onItemClick={onItemClick} />

          <Reward item={standardItem} onItemClick={onItemClick} />
        </>
      )}

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[4.25rem] h-[4.25rem]">
        <Image
          className="object-contain"
          src={isNodeAchevied ? acheviedLevelNodeImg : lockedLevelNodeImg}
          alt=""
          fill
          sizes="100%"
        />
      </div>
    </div>
  );
};

export default Step;
