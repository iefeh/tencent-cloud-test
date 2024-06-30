import { Tooltip, cn } from '@nextui-org/react';
import Image from 'next/image';
import { FC } from 'react';

interface Props {
  stakeValue: string;
  duration: string;
}

const StakingRewards: FC<Props> = ({ stakeValue, duration }) => {
  const rewards = [
    {
      label: 'Factor',
      value: '1.2x',
      tips: 'The Locking Factor is a multiplier that increases your rewards when earning Staking Points. The longer you lock your assets, the higher the multiplier you can achieve. The maximum multiplier is 5x for the longest locking duration.',
    },
    {
      label: 'Est. Reward staking points',
      value: '200 sp',
      tips: 'This is the estimated maximum Staking Points you can earn in the current transaction. You can check your actual earnings from the History page.',
    },
    {
      label: 'Duration',
      value: '2 weeks',
      tips: '',
    },
    {
      label: 'Unlock on',
      value: '2024-4-24 08:00',
      tips: +duration > 0 ? '' : 'No locking duration allows you to withdraw your deposits at any time.',
    },
  ];

  return (
    <>
      <div className="flex justify-center items-center mt-12">
        <div className="text-2xl leading-none text-basic-yellow font-semakin">Staking Rewards</div>
      </div>

      <div className="flex justify-center items-center flex-wrap gap-x-[3.875rem] gap-y-[1.875rem] mt-[1.875rem]">
        {rewards.map((reward, index) => (
          <div
            key={index}
            className={cn([
              'relative flex justify-between items-center',
              'w-[31.25rem] h-[2.5625rem] pl-3 pr-5',
              "bg-[url('https://moonveil-public.s3.ap-southeast-2.amazonaws.com/pledge/bg_reward.png')] bg-no-repeat bg-contain",
              'text-black font-semibold text-xl',
            ])}
          >
            {reward.tips && (
              <Tooltip content={reward.tips}>
                <Image
                  className="w-[1.0625rem] h-[1.0625rem] object-contain mr-3"
                  src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/pledge/icons/icon_info_small.png"
                  alt=""
                  width={17}
                  height={17}
                  unoptimized
                />
              </Tooltip>
            )}

            <div className="flex-1">{reward.label}</div>

            <div>{reward.value}</div>
          </div>
        ))}
      </div>
    </>
  );
};

export default StakingRewards;
