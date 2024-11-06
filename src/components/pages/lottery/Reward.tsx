import { LotteryBorders, LotteryRewardSizes, LotteryRewardType, RewardQuality } from '@/constant/lottery';
import { Lottery } from '@/types/lottery';
import { Tooltip, cn } from '@nextui-org/react';
import Image from 'next/image';
import { FC } from 'react';

const Reward: FC<ClassNameProps & ItemProps<Lottery.RewardItem>> = ({ className, item }) => {
  const { icon_url, reward_type, reward_level, reward_name, amount } = item || {};
  const border = LotteryBorders[reward_level || RewardQuality.BLUE];

  const iconURL =
    reward_type === LotteryRewardType.NoPrize
      ? 'https://d3dhz6pjw7pz9d.cloudfront.net/lottery/thx.gif'
      : icon_url;
  const itemSize = reward_type ? LotteryRewardSizes[reward_type as keyof typeof LotteryRewardSizes] || '90%' : '90%';

  return (
    <div className="flex flex-col items-center">
      <div className={cn(['relative w-[9.625rem] h-[9.625rem] flex flex-col justify-center items-center', className])}>
        <Image
          className="object-contain absolute left-0 bottom-0 z-0 max-w-none"
          src={border.img}
          style={{ width: `${border.width / 1.54}%`, height: `${border.height / 1.54}%` }}
          alt=""
          width={154}
          height={154}
          unoptimized
        />

        <div className="relative z-0" style={{ width: itemSize, height: itemSize }}>
          {iconURL && (
            <Image className="object-contain rounded-lg" src={iconURL} alt="" fill sizes="100%" unoptimized />
          )}
        </div>
      </div>

      <Tooltip content={reward_name || '--'}>
        <div className={cn(['w-[9.625rem] h-12 grow-0 text-sm mt-2 line-clamp-2', className])}>
          {reward_name || '--'}
        </div>
      </Tooltip>
    </div>
  );
};

export default Reward;
