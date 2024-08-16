import BattlePass from './BattlePass';
import LGButton from '@/pages/components/common/buttons/LGButton';
import { Lottery } from '@/types/lottery';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

const PoolCard: FC<ItemProps<Lottery.Pool>> = ({ item }) => {
  return (
    <div className="flex flex-col px-6 py-7 bg-[#0E0E0E] border-1 border-basic-gray rounded-base transition-colors hover:border-basic-yellow">
      <div className="relative w-full aspect-square">
        <Image
          className="object-cover rounded-base"
          src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/lottery/img_pool_test.png"
          alt=""
          fill
          unoptimized
          priority
        />

        <div className="absolute top-[3.5%] left-[3.5%] flex items-center gap-x-2">
          <div className="flex items-center pl-ten pr-4 pt-1 pb-[0.1875rem] bg-white/20 rounded-five text-sm leading-none">
            <Image
              className="w-6 h-6 object-contain mr-[0.375rem]"
              src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/lottery/icons/icon_time.png"
              alt=""
              width={48}
              height={48}
              unoptimized
            />

            <span>Close in 3 days</span>
          </div>

          <div className="flex items-center pl-ten pr-4 pt-1 pb-[0.1875rem] bg-white/20 rounded-five text-sm leading-none">
            <Image
              className="w-6 h-6 object-contain mr-[0.375rem]"
              src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/lottery/icons/icon_qty.png"
              alt=""
              width={48}
              height={48}
              unoptimized
            />

            <span>Limited Qty : 3</span>
          </div>
        </div>

        <div className="absolute top-[13%] left-[3.5%]">
          <div className="flex items-center px-[1.125rem] py-2 bg-white/20 rounded-five text-sm leading-none">
            <span className="text-basic-yellow">In progress</span>
          </div>
        </div>
      </div>

      <div className="mt-5 text-white text-xl leading-6">AstrArk Character Voice Rally</div>

      <div className="flex flex-wrap gap-x-4 gap-y-5 mt-6">
        {(item?.rewards || []).slice(0, 3).map((reward, index) => (
          <div key={index} className="flex items-center">
            <Image
              className="w-8 h-8 object-contain"
              src={reward.icon_url}
              alt=""
              width={64}
              height={64}
              unoptimized
              priority
            />

            <span className="ml-2 font-semakin text-base text-basic-yellow">{reward.reward_name || '--'}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mt-16">
        <BattlePass hideTitle />

        <Link href={`/lottery/${item?.lottery_pool_id}`} target="_blank">
          <LGButton className="w-[8.75rem]" label="Play" />
        </Link>
      </div>
    </div>
  );
};

export default PoolCard;
