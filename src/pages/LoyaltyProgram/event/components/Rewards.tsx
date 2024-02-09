import Image from 'next/image';
import rewardImg from 'img/loyalty/task/reward.png';
import rewardBgImg from 'img/loyalty/task/bg_reward.png';
import { useState } from 'react';

export default function Rewards() {
  const [rewards, setRewards] = useState([
    {
      label: 'Moon Beams',
      reward: null,
    },
    {
      label: 'Event Badge',
      reward: 1,
    },
    {
      label: 'nft',
      reward: 1,
    },
  ]);

  return (
    <div className="mt-[1.875rem]">
      <div className="font-semakin text-xl text-basic-yellow">Rewards</div>

      <div className="border-1 border-basic-gray rounded-[0.625rem] overflow-hidden mt-[1.625rem]">
        <Image className="w-[25.625rem] h-[25.625rem]" src={rewardImg} alt="" width={410} height={410} />

        <div className="pt-[1.375rem] pr-[2.375rem] pb-[2.25rem] pl-[2.1875rem] w-full h-[10.625rem] flex flex-col justify-between relative border-t-1 border-basic-gray">
          <Image src={rewardBgImg} alt="" fill />

          {rewards.map((item, index) => (
            <div
              key={index}
              className="flex justify-between items-center font-semakin text-lg leading-none text-basic-yellow relative z-0"
            >
              <div>{item.label}</div>
              <div>{item.reward}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
