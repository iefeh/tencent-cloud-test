import { FC, useRef } from 'react';
import Image from 'next/image';
import bgImg from 'img/loyalty/season/bg_reward_final.png';
import { observer } from 'mobx-react-lite';
import { useBattlePassContext } from '@/store/BattlePass';
import { BattlePassBadgeRewardDTO } from '@/http/services/battlepass';
import { Tooltip, cn } from '@nextui-org/react';
import { CSSTransition } from 'react-transition-group';
import tooltipBgImg from 'img/loyalty/season/bg_reward.png';

interface Props {
  visible?: boolean;
  className?: string;
}

const FinalReward: FC<Props> = ({ className, visible }) => {
  const { info } = useBattlePassContext();
  const { standard_pass = [], premium_pass = [] } = info || {};
  const finalPass = standard_pass[standard_pass.length - 1] || premium_pass[premium_pass.length - 1];
  const { rewards = [] } = finalPass || {};
  const finalBadgeReward = rewards.find((re) => re.type === 'badge') as BattlePassBadgeRewardDTO | undefined;
  const { properties: { image_url = '' } = {} } = finalBadgeReward || {};
  const nodeRef = useRef<HTMLDivElement>(null);

  return (
    <CSSTransition in={visible} classNames="transition-fade-right" nodeRef={nodeRef} timeout={800}>
      <Tooltip
        placement="top"
        classNames={{ content: 'bg-transparent' }}
        content={
          <div className="w-[31.25rem] h-[15.125rem] relative pt-12 text-left px-8">
            <Image className="object-contain rotate-180" src={tooltipBgImg} alt="" fill sizes="100%" />

            <div className="font-semakin text-3xl relative z-0 text-basic-yellow">Win $MORE Token Now!</div>

            <div className="relative z-0 text-xl mt-4">
              Level up your season pass, win more Moon Beams to secure your{' '}
              <span className="text-basic-yellow">$MORE</span> token airdrop.
            </div>
          </div>
        }
      >
        <div
          ref={nodeRef}
          className={cn([
            'w-[18.75rem] h-[18.75rem] relative flex justify-center items-center',
            "hover:[&>.img-box]:!bg-[url('/img/loyalty/season/bg_final_hover.png')]",
            className,
          ])}
        >
          <Image className="object-contain" src={bgImg} alt="" fill sizes="100%" />

          <div
            className={cn([
              'img-box relative z-0 w-28 h-28 overflow-hidden rounded-full',
              'flex items-end',
              'bg-no-repeat bg-contain',
              'transition-background',
            ])}
            style={{ backgroundImage: `url('${image_url}')` }}
          ></div>

          <div
            className={cn([
              'absolute left-1/2 bottom-9 -translate-x-1/2',
              'text-2xl text-transparent font-semakin whitespace-nowrap leading-none',
              'bg-gradient-to-b from-[#D9A970] to-[#EFEBC5] bg-clip-text',
            ])}
          >
            Ultimate Reward
          </div>
        </div>
      </Tooltip>
    </CSSTransition>
  );
};

export default observer(FinalReward);
