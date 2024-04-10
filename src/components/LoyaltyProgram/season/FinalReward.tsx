import { FC } from 'react';
import Image from 'next/image';
import { observer } from 'mobx-react-lite';
import { useBattlePassContext } from '@/store/BattlePass';
import { BattlePassBadgeRewardDTO, BattlePassLevelDTO } from '@/http/services/battlepass';
import { cn } from '@nextui-org/react';
import lockedYellowBg from 'img/loyalty/season/bg_reward_yellow_locked.png';
import acheivedYellowBg from 'img/loyalty/season/bg_reward_yellow_achevied.png';
import claimedYellowBg from 'img/loyalty/season/bg_reward_yellow_claimed.png';
import lockedBlueBg from 'img/loyalty/season/bg_reward_blue_locked.png';
import acheivedBlueBg from 'img/loyalty/season/bg_reward_blue_achevied.png';
import claimedBlueBg from 'img/loyalty/season/bg_reward_blue_claimed.png';
import LGButton from '@/pages/components/common/buttons/LGButton';
import lockedIcon from 'img/loyalty/season/icon_locked.png';
import claimedIcon from 'img/loyalty/season/icon_claimed.png';
import RewardTooltip from './Ladder/RewardTooltip';

interface Props {
  className?: string;
  onItemClick?: (item?: BattlePassLevelDTO) => void;
}

const bgImgs = [
  [lockedYellowBg, acheivedYellowBg, claimedYellowBg],
  [lockedBlueBg, acheivedBlueBg, claimedBlueBg],
];

const FinalReward: FC<Props> = ({ className, onItemClick }) => {
  const { finalPass } = useBattlePassContext();
  const { lv, reward_type, satisfied_time, claimed_time, rewards = [] } = finalPass || {};
  const isPremium = reward_type === 'premium';
  const locked = !satisfied_time;
  const acheived = !!satisfied_time;
  const claimed = !!claimed_time;
  const bgImg = bgImgs[isPremium ? 0 : 1]?.[claimed ? 2 : acheived ? 1 : 0];
  const badgeReward = (rewards || []).find((re) => re.type === 'badge') as BattlePassBadgeRewardDTO | undefined;

  return (
    <RewardTooltip items={rewards}>
      <div className={cn(['relative cursor-pointer', className])} onClick={() => onItemClick?.(finalPass)}>
        <div className="w-[22.125rem] h-[22.125rem] relative flex justify-center items-center">
          {bgImg && <Image className="object-contain" src={bgImg} alt="" fill sizes="100%" />}

          {badgeReward && (
            <div className="relative z-0 w-60 h-60 overflow-hidden rounded-full flex items-end">
              <Image className="object-cover" src={badgeReward.properties.icon_url} alt="" fill sizes="100%" />

              {acheived && !claimed && <LGButton className="w-full h-[2.5rem] rounded-none" label="Claim" actived />}
            </div>
          )}

          {locked && (
            <Image
              className="w-7 h-7 object-contain absolute top-[0.875rem] right-[0.875rem]"
              src={lockedIcon}
              alt=""
            />
          )}

          {claimed && (
            <Image
              className="w-7 h-7 object-contain absolute top-[0.875rem] right-[0.875rem]"
              src={claimedIcon}
              alt=""
            />
          )}
        </div>

        <div
          className={cn([
            'absolute -bottom-9 left-1/2 -translate-x-1/2 text-lg',
            locked ? 'text-[#CCCCCC]' : isPremium ? 'text-basic-yellow' : 'text-basic-blue',
          ])}
        >
          Lv.{lv || '--'}
        </div>
      </div>
    </RewardTooltip>
  );
};

export default observer(FinalReward);
