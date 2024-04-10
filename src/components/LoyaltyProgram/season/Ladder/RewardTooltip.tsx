import { BattlePassRewardDTO } from '@/http/services/battlepass';
import Image from 'next/image';
import { FC } from 'react';
import bgImg from 'img/loyalty/season/bg_reward.png';
import bgLineImg from 'img/loyalty/season/bg_reward_line.png';
import { Tooltip } from '@nextui-org/react';
import RewardsBelt from './RewardsBelt';

interface Props {
  children?: JSX.Element;
  items?: BattlePassRewardDTO[];
}

const RewardTooltip: FC<Props> = ({ items = [], children }) => {
  return (
    <Tooltip
      placement="bottom"
      classNames={{ content: 'bg-transparent shadow-none' }}
      content={
        <div className="w-[31.25rem] h-[15.125rem] relative pt-8 text-center">
          <Image className="object-contain" src={bgImg} alt="" fill sizes="100%" />
          <Image
            className="absolute top-[2.375rem] left-1/2 -translate-x-1/2 w-[18.5625rem] h-1px z-0"
            src={bgLineImg}
            alt=""
            width={297}
            height={1}
          />

          <div className="relative z-0 font-semakin text-base text-basic-yellow leading-none">Rewards</div>

          <RewardsBelt className="mt-6" items={items} />
        </div>
      }
    >
      {children}
    </Tooltip>
  );
};

export default RewardTooltip;
