import { observer } from 'mobx-react-lite';
import Image from 'next/image';
import { FC, useState } from 'react';
import lockedYellowBg from 'img/loyalty/season/bg_reward_yellow_locked.png';
import acheivedYellowBg from 'img/loyalty/season/bg_reward_yellow_achevied.png';
import claimedYellowBg from 'img/loyalty/season/bg_reward_yellow_claimed.png';
import lockedBlueBg from 'img/loyalty/season/bg_reward_blue_locked.png';
import acheivedBlueBg from 'img/loyalty/season/bg_reward_blue_achevied.png';
import claimedBlueBg from 'img/loyalty/season/bg_reward_blue_claimed.png';
import { BattlePassBadgeRewardDTO, BattlePassLevelDTO, claimBattleRewardAPI } from '@/http/services/battlepass';
import lockedIcon from 'img/loyalty/season/icon_locked.png';
import claimedIcon from 'img/loyalty/season/icon_claimed.png';
import { cn } from '@nextui-org/react';
import LGButton from '@/pages/components/common/buttons/LGButton';
import { throttle } from 'lodash';
import { toast } from 'react-toastify';
import { useBattlePassContext } from '@/store/BattlePass';
import RewardTooltip from './RewardTooltip';

interface Props {
  item?: BattlePassLevelDTO;
  onItemClick?: (item?: BattlePassLevelDTO) => void;
}

const bgImgs = [
  [lockedYellowBg, acheivedYellowBg, claimedYellowBg],
  [lockedBlueBg, acheivedBlueBg, claimedBlueBg],
];

const Reward: FC<Props> = ({ item, onItemClick }) => {
  const { init } = useBattlePassContext();
  const { lv, reward_type, satisfied_time, claimed_time, rewards } = item || {};
  const isPremium = reward_type === 'premium';
  const locked = !satisfied_time;
  const acheived = !!satisfied_time;
  const claimed = !!claimed_time;
  const bgImg = bgImgs[isPremium ? 0 : 1]?.[claimed ? 2 : acheived ? 1 : 0];
  const badgeReward = (rewards || []).find((re) => re.type === 'badge') as BattlePassBadgeRewardDTO | undefined;
  const [loading, setLoading] = useState(false);

  const onClaim = throttle(async () => {
    setLoading(true);
    const data = { reward_type: reward_type!, lv: +(lv || 0) };
    const res = await claimBattleRewardAPI(data);
    if (res.result) {
      toast.success(res.result);
    }
    await init(true);
    setLoading(false);
  }, 500);

  const line = (
    <div
      className={cn([
        'w-[8.875rem] h-[0.25rem] rounded-l-md shadow-[0_0_0.5rem_1px]',
        locked
          ? 'bg-[#333333] shadow-transparent'
          : isPremium
          ? 'bg-basic-yellow shadow-basic-yellow'
          : 'bg-basic-blue shadow-basic-blue',
      ])}
    ></div>
  );

  return (
    <>
      {!isPremium && line}

      <RewardTooltip items={item?.rewards}>
        <div className="relative" onClick={() => onItemClick?.(item)}>
          <div className="w-[11.0625rem] h-[11.0625rem] relative flex justify-center items-center">
            {bgImg && <Image className="object-contain" src={bgImg} alt="" fill sizes="100%" />}

            {badgeReward && (
              <div className="relative z-0 w-[7.5rem] h-[7.5rem] overflow-hidden rounded-full flex items-end">
                <Image className="object-cover" src={badgeReward.properties.image_url} alt="" fill sizes="100%" />

                {acheived && !claimed && (
                  <LGButton
                    className="w-full h-[1.75rem] rounded-none"
                    label="Claim"
                    actived
                    loading={loading}
                    onClick={onClaim}
                  />
                )}
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

      {isPremium && line}
    </>
  );
};

export default observer(Reward);
