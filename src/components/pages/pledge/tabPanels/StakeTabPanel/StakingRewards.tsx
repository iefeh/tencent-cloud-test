import { Tooltip, cn } from '@nextui-org/react';
import Image from 'next/image';
import { FC } from 'react';

const StakingRewards: FC = () => {
  const rewards = [
    {
      label: 'Factor',
      value: '1.2x',
      tips: '123',
    },
    {
      label: 'Est. Reward staking points',
      value: '200 sp',
    },
    {
      label: 'Duration',
      value: '2 weeks',
    },
    {
      label: 'Unlock on',
      value: '2024-4-24 08:00',
    },
  ];

  return (
    <>
      <div className="flex justify-center items-center mt-12">
        <div className="text-2xl leading-none text-basic-yellow font-semakin">Staking Rewards</div>

        <Image
          className="w-[1.0625rem] h-[1.0625rem] object-contain ml-4"
          src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/pledge/icons/icon_info_small.png"
          alt=""
          width={17}
          height={17}
          unoptimized
        />
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
