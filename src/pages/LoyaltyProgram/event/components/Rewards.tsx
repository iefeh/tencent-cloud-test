import Image from 'next/image';
import rewardImg from 'img/loyalty/task/reward.png';
import rewardBgImg from 'img/loyalty/task/bg_reward.png';
import { EventReward, FullEventItem } from '@/http/services/task';
import trifleImg from 'img/nft/trifle/trifle_active_1.jpg';
import { useEffect, useState } from 'react';
import { Tooltip } from '@nextui-org/react';
import { EVENT_REWARD_TYPE } from '@/constant/task';
import notifyIcon from 'img/icon/icon_notify.png';
import Link from 'next/link';

interface Props {
  item?: FullEventItem;
}

export default function Rewards(props: Props) {
  const { item } = props;
  const [rewards, setRewards] = useState<Partial<EventReward>[]>([]);

  useEffect(() => {
    const list: Partial<EventReward>[] = item?.rewards || [];

    if ((item?.claim_settings?.reward_accelerators?.length || 0) > 0) {
      list.push({
        type: EVENT_REWARD_TYPE.NFT_BONUS,
        name: 'NFT Holder Bonus',
      });
    }

    setRewards(list);
  }, [item]);

  return (
    <div className="mt-[1.875rem]">
      <div className="font-semakin text-xl text-basic-yellow">Rewards</div>

      <div className="border-1 border-basic-gray rounded-[0.625rem] overflow-hidden mt-[1.625rem]">
        <Image
          className="w-[25.625rem] h-[25.625rem] object-contain"
          src={item?.rewards?.[0]?.image_medium || rewardImg}
          alt=""
          width={410}
          height={410}
        />

        <div className="pt-[1.375rem] pr-[2.375rem] pb-[2.25rem] pl-[2.1875rem] w-full flex flex-col justify-between gap-5 relative border-t-1 border-basic-gray">
          <Image src={rewardBgImg} alt="" fill sizes="100%" />

          {rewards.map((reward, index) => {
            const isBonus = reward.type === EVENT_REWARD_TYPE.NFT_BONUS;

            const row = (
              <div
                key={index}
                className="flex justify-between items-center font-semakin text-lg leading-none text-basic-yellow relative z-0"
              >
                <div>{reward.name}</div>

                {isBonus ? (
                  <Image className="w-8 h-8" src={trifleImg} alt="" />
                ) : (
                  <div className="flex items-center gap-1">
                    {reward.image_small && (
                      <div className="w-6 h-6 relative">
                        <Image className="object-contain" src={reward.image_small} alt="" fill sizes="100%" />
                      </div>
                    )}
                    <span>{reward.type === 'moon_beam' ? `${reward.amount || 0} MBS` : reward.amount}</span>
                  </div>
                )}
              </div>
            );

            let tooltipContent = null;

            if (reward.type === EVENT_REWARD_TYPE.NFT_BONUS) {
              tooltipContent = (
                <div className="px-8 py-4 max-w-lg">
                  <div className="font-semakin text-2xl text-basic-yellow text-center">NFT Holder Bonus</div>
                  <div className="text-base">
                    <p className="mt-4">
                      As a holder of any Moonveil ecosystem NFTs, you&apos;re eligible for bonus rewards after holding
                      them for over 24 hours as follows:
                    </p>

                    <ul className="mt-4">
                      {(item?.claim_settings?.reward_accelerators || []).map((acc, accIndex) => (
                        <li key={accIndex} className="flex items-center li [&>.li]:mt-2">
                          <div className="w-3 h-3 rounded-full bg-white mr-2"></div>

                          <div>
                            <span>{acc.name}</span>, +{acc.properties.reward_bonus * 100}%,{' '}
                            {acc.properties.reward_bonus_moon_beam}MB per item,{' '}
                            <a className="underline" href={acc.properties.nft_market_url} target="_blank">
                              Go get
                            </a>
                            !
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            } else if (reward.type === EVENT_REWARD_TYPE.BADGE) {
              tooltipContent = (
                <div className="px-8 py-4 max-w-lg flex">
                  <Image className="shrink-0 w-5 h-5 mt-1 mr-2" src={notifyIcon} alt="" sizes="100%" />

                  <p className="text-base">
                    Please note that only the highest-level badge style in this series is displayed here. The specific
                    badge style you receive will depend on the achievements you accomplish. You can also check more
                    details from your{' '}
                    <Link className="text-basic-yellow underline" href="/Profile/MyBadges">
                      Badge Center
                    </Link>
                    .
                  </p>
                </div>
              );
            }

            if (!tooltipContent) return row;

            return (
              <Tooltip key={index} content={tooltipContent}>
                {row}
              </Tooltip>
            );
          })}
        </div>
      </div>
    </div>
  );
}
