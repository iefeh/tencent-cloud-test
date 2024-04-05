import { FC } from 'react';
import Image from 'next/image';
import bgImg from 'img/loyalty/season/bg_reward_final.png';
import { observer } from 'mobx-react-lite';
import { useBattlePassContext } from '@/store/BattlePass';
import { BattlePassBadgeRewardDTO } from '@/http/services/battlepass';
import { cn } from '@nextui-org/react';

interface Props {
  className?: string;
}

const FinalReward: FC<Props> = ({ className }) => {
  const { info } = useBattlePassContext();
  const { standard_pass = [], premium_pass = [] } = info || {};
  const finalPass = standard_pass[standard_pass.length - 1] || premium_pass[premium_pass.length - 1];
  const { rewards = [] } = finalPass || {};
  const finalBadgeReward = rewards.find((re) => re.type === 'badge') as BattlePassBadgeRewardDTO | undefined;
  const { properties: { image_url = '' } = {} } = finalBadgeReward || {};

  return (
    <div className={cn(['w-[18.75rem] h-[18.75rem] relative flex justify-center items-center', className])}>
      <Image className="object-contain" src={bgImg} alt="" fill sizes="100%" />

      <div className="relative z-0 w-28 h-28 overflow-hidden rounded-full flex items-end">
        <Image className="object-cover" src={image_url} alt="" fill sizes="100%" />
      </div>

      <div
        className={cn([
          'absolute left-1/2 bottom-10 -translate-x-1/2',
          'text-2xl text-transparent font-semakin whitespace-nowrap leading-none',
          'bg-gradient-to-b from-[#D9A970] to-[#EFEBC5] bg-clip-text',
        ])}
      >
        Ultimate Reward
      </div>
    </div>
  );
};

export default observer(FinalReward);
