import Image from 'next/image';
import rewardImg from 'img/loyalty/task/reward.png';
import rewardBgImg from 'img/loyalty/task/bg_reward.png';
import { EventReward, FullEventItem } from '@/http/services/task';
import trifleImg from 'img/nft/trifle/trifle_active_1.jpg';
import { useEffect, useState } from 'react';
import { Tooltip } from '@nextui-org/react';

interface Props {
  item?: FullEventItem;
}

const TYPE_NFT_BONUS = 'nft_bonus';

export default function Rewards(props: Props) {
  const { item } = props;
  const [rewards, setRewards] = useState<Partial<EventReward>[]>([]);

  useEffect(() => {
    const list: Partial<EventReward>[] = item?.rewards || [];

    if ((item?.claim_settings?.reward_accelerators?.length || 0) > 0) {
      list.push({
        type: TYPE_NFT_BONUS,
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
          className="w-[25.625rem] h-[25.625rem]"
          src={item?.rewards?.[0]?.image_medium || rewardImg}
          alt=""
          width={410}
          height={410}
        />

        <div className="pt-[1.375rem] pr-[2.375rem] pb-[2.25rem] pl-[2.1875rem] w-full flex flex-col justify-between gap-5 relative border-t-1 border-basic-gray">
          <Image src={rewardBgImg} alt="" fill sizes='100%' />

          {rewards.map((reward, index) => {
            const isBonus = reward.type === TYPE_NFT_BONUS;

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
                        <Image className="object-contain" src={reward.image_small} alt="" fill sizes='100%' />
                      </div>
                    )}
                    <span>{reward.type === 'moon_beam' ? `${reward.amount || 0} MBS` : reward.amount}</span>
                  </div>
                )}
              </div>
            );

            if (!isBonus) return row;

            return (
              <Tooltip
                key={index}
                content={
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
                }
              >
                {row}
              </Tooltip>
            );
          })}
        </div>
      </div>
    </div>
  );
}
