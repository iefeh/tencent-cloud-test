import { LotteryBorders, RewardQuality } from '@/constant/lottery';
import { Lottery } from '@/types/lottery';
import { cn } from '@nextui-org/react';
import Image from 'next/image';
import { FC } from 'react';

const Reward: FC<ClassNameProps & ItemProps<Lottery.RewardItem>> = ({ className, item }) => {
  const { icon_url, reward_level, reward_name, amount } = item || {};
  const border = LotteryBorders[reward_level || RewardQuality.BLUE];

  return (
    <div className="flex flex-col items-center">
      <div className={cn(['relative w-[9.625rem] h-[9.625rem] flex flex-col justify-center items-center', className])}>
        <Image
          className="object-contain absolute left-0 bottom-0 z-0 max-w-none"
          src={border.img}
          style={{ width: `${border.width / 1.62}%`, height: `${border.height / 1.62}%` }}
          alt=""
          width={154}
          height={154}
          unoptimized
        />

        {icon_url && (
          <div className="w-[90%] h-[90%] relative z-0">
            <Image className="object-contain" src={icon_url} alt="" fill sizes="100%" unoptimized />
          </div>
        )}
      </div>

      <div className="text-sm mt-2">
        {reward_name || '--'} X{amount || '--'}
      </div>
    </div>
  );
};

export default Reward;
