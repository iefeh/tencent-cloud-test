import Image from 'next/image';
import rewardImg from 'img/loyalty/task/reward.png';
import rewardBgImg from 'img/loyalty/task/bg_reward.png';
import { useState } from 'react';
import { FullEventItem } from '@/http/services/task';

interface Props {
  item?: FullEventItem;
}

export default function Rewards(props: Props) {
  const { item } = props;

  return (
    <div className="mt-[1.875rem]">
      <div className="font-semakin text-xl text-basic-yellow">Rewards</div>

      <div className="border-1 border-basic-gray rounded-[0.625rem] overflow-hidden mt-[1.625rem]">
        <Image className="w-[25.625rem] h-[25.625rem]" src={rewardImg} alt="" width={410} height={410} />

        <div className="pt-[1.375rem] pr-[2.375rem] pb-[2.25rem] pl-[2.1875rem] w-full flex flex-col justify-between gap-5 relative border-t-1 border-basic-gray">
          <Image src={rewardBgImg} alt="" fill />

          {(item?.rewards || []).map((reward, index) => (
            <div
              key={index}
              className="flex justify-between items-center font-semakin text-lg leading-none text-basic-yellow relative z-0"
            >
              <div>{reward.name}</div>
              <div>{reward.amount}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
