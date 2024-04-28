import Image from 'next/image';
import rewardImg from 'img/loyalty/task/reward.png';
import rewardBgImg from 'img/loyalty/task/bg_reward.png';
import { EventReward, EventRewardAcceleratorProperty, FullEventItem } from '@/http/services/task';
import trifleImg from 'img/nft/trifle/trifle_active_1.jpg';
import badgeImg from 'img/loyalty/season/pass_badge.png';
import lockImg from 'img/loyalty/season/icon_locked.png';
import claimedImg from 'img/loyalty/season/icon_claimed.png';
import { useEffect, useState } from 'react';
import { Tooltip, cn } from '@nextui-org/react';
import { AcceleratorType, EVENT_REWARD_TYPE } from '@/constant/task';
import notifyIcon from 'img/icon/icon_notify.png';
import Link from 'next/link';

interface Props {
  item?: FullEventItem;
}

interface Accelerator {
  name: string;
  type: AcceleratorType;
  image_url: string;
  description: string;
  properties: EventRewardAcceleratorProperty;
}

const AcceleratorIcons = {
  [AcceleratorType.NFT]: trifleImg,
  [AcceleratorType.BADGE]: badgeImg,
};

export default function Rewards(props: Props) {
  const { item } = props;
  const [rewards, setRewards] = useState<Partial<EventReward>[]>([]);
  const motoAccelerators = item?.claim_settings.reward_accelerators || [];

  useEffect(() => {
    const list: Partial<EventReward>[] = item?.rewards || [];

    if ((motoAccelerators.length || 0) > 0) {
      list.push({
        type: EVENT_REWARD_TYPE.Multiplier,
        name: 'Multipliers',
      });
    }

    setRewards(list);
  }, [item]);

  let task = rewards.filter((item) => item.type === EVENT_REWARD_TYPE.TASK);
  let taskAmount = task && task.length > 0 ? task[0].amount : 0;

  const acceleratorsDict: { [key: string]: Accelerator[] } = {};
  motoAccelerators.forEach((item) => {
    const { type } = item;
    if (acceleratorsDict[type]) {
      acceleratorsDict[type].push(item);
    } else {
      acceleratorsDict[type] = [item];
    }
  });

  const accelerators = Object.values(acceleratorsDict);
  const totalMultipliers = motoAccelerators.reduce((p, c) => (p += (+c.properties.reward_bonus || 0) * 100), 0);
  const totalMBs = motoAccelerators.reduce((p, c) => (p += +c.properties.reward_bonus_moon_beam || 0), 0);

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
            const isMultiplier = reward.type === EVENT_REWARD_TYPE.Multiplier;

            const row = (
              <div
                key={index}
                className="flex justify-between items-center font-semakin text-lg leading-none text-basic-yellow relative z-0"
              >
                <div className={isMultiplier && totalMultipliers <= 0 ? 'grayscale' : ''}>{reward.name}</div>

                {isMultiplier ? (
                  <div className="flex items-center">
                    {accelerators.map((accs, accsIndex) => {
                      const icon = AcceleratorIcons[accs[0].type];
                      if (!icon) return null;
                      const total = accs.reduce((p, c) => (p += (+c.properties.reward_bonus || 0) * 100), 0);

                      return (
                        <div
                          className={cn([
                            'w-8 h-8 relative border-1 [&+div]:ml-2 rounded-md',
                            total > 0 ? 'border-basic-yellow' : 'border-[#2C2C2C]',
                          ])}
                          key={accsIndex}
                        >
                          <Image
                            className="object-contain rounded-md"
                            src={AcceleratorIcons[accs[0].type]}
                            alt=""
                            fill
                            sizes="100%"
                          />

                          <Image
                            className="absolute -top-1 -right-1 w-3 h-3"
                            src={total > 0 ? claimedImg : lockImg}
                            alt=""
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    {reward.image_small && (
                      <div className="w-6 h-6 relative">
                        <Image className="object-contain" src={reward.image_small} alt="" fill sizes="100%" />
                      </div>
                    )}
                    <span>
                      {reward.type === EVENT_REWARD_TYPE.MOON_BEAM ? `${reward.amount || 0} MBS` : reward.amount}
                    </span>
                  </div>
                )}
              </div>
            );

            let tooltipContent = null;

            if (reward.type === EVENT_REWARD_TYPE.Multiplier) {
              tooltipContent = (
                <div className="px-8 py-4 max-w-lg">
                  <div className="font-semakin text-2xl text-basic-yellow text-center">Moonveil Multipliers</div>

                  <div className="flex justify-center items-center gap-6 text-basic-yellow mt-4 text-lg">
                    <div>
                      Total Multipliers: {totalMultipliers > 0 ? '+' : ''}
                      {totalMultipliers}%
                    </div>
                    <div>
                      Total Moon Beams: {totalMBs > 0 ? '+' : ''}
                      {totalMBs}
                    </div>
                  </div>

                  <div className="text-base">
                    <ul className="mt-4">
                      {accelerators.map((accs, accsIndex) => (
                        <li key={accsIndex} className="li [&+.li]:mt-4">
                          <p>
                            {accsIndex + 1}. {accs[0].description}
                          </p>

                          {accs[0].type === AcceleratorType.BADGE &&
                          !accs.some((acc) => acc.properties.reward_bonus > 0) ? (
                            <div className="flex pl-3 mt-2">
                              <span className="w-3 h-3 rounded-full bg-white mr-2 mt-1"></span>

                              <span>You currently do not have any qualifying badges.</span>
                            </div>
                          ) : (
                            accs.map((acc, accIndex) => {
                              return (
                                <div key={accIndex} className="flex pl-3 mt-2">
                                  <span className="w-3 h-3 rounded-full bg-white mr-2 mt-1"></span>

                                  <span>
                                    <span>{acc.name}</span>, +{acc.properties.reward_bonus * 100}%,{' '}
                                    {acc.properties.reward_bonus_moon_beam} MBs
                                    {acc.type === AcceleratorType.NFT && <> per item</>}
                                    {acc.properties.nft_market_url && (
                                      <>
                                        ,{' '}
                                        <a
                                          className="underline text-basic-blue"
                                          href={acc.properties.nft_market_url}
                                          target="_blank"
                                        >
                                          Go get
                                        </a>
                                      </>
                                    )}
                                    !
                                  </span>
                                </div>
                              );
                            })
                          )}
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
            } else if (reward.type === EVENT_REWARD_TYPE.TASK) {
              tooltipContent = (
                <div className="px-8 py-4 max-w-lg flex">
                  <Image className="shrink-0 w-5 h-5 mt-1 mr-2" src={notifyIcon} alt="" sizes="100%" />
                  <p className="text-base">
                    After completing this event, your Season Pass can level up, advancing you {reward.amount} tasks
                    further in the season.
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
          {taskAmount && taskAmount > 0 ? (
            <Tooltip
              key="taskNote"
              content={
                <div className="px-8 py-4 max-w-lg flex">
                  <Image className="shrink-0 w-5 h-5 mt-1 mr-2" src={notifyIcon} alt="" sizes="100%" />
                  <p className="text-base">
                    After completing this event, your Season Pass can level up, advancing you{' '}
                    <span className="text-basic-yellow">{taskAmount}</span> tasks further in the season.
                  </p>
                </div>
              }
            >
              <div
                key="taskNote"
                className="flex justify-between items-center font-semakin text-lg leading-none text-basic-yellow relative z-0"
              >
                <div>Season Pass Progress</div>
                <div className="flex items-center gap-1">
                  <span>
                    + <span className="text-basic-yellow">{taskAmount}</span> TASKS
                  </span>
                </div>
              </div>
            </Tooltip>
          ) : null}
        </div>
      </div>
    </div>
  );
}
