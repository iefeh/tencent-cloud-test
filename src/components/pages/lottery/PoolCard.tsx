import { LotteryStatusConfig } from '@/constant/lottery';
import BattlePass from './BattlePass';
import LGButton from '@/pages/components/common/buttons/LGButton';
import { Lottery } from '@/types/lottery';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';
import dayjs from 'dayjs';
import Duration from 'dayjs/plugin/duration';

dayjs.extend(Duration);

const PoolCard: FC<ItemProps<Lottery.Pool>> = ({ item }) => {
  const limitedTime = getLimitedTime();

  function getLimitedTime() {
    const du = dayjs.duration(Math.max((item?.end_time || 0) - Date.now(), 0));

    const days = ~~du.asDays();
    if (days > 0) return `${days} days`;

    const hours = du.hours();
    if (hours > 0) return `${hours} hours`;

    const mins = du.minutes();
    return `${mins} minutes`;
  }

  return (
    <div className="flex flex-col justify-between px-6 py-7 bg-[#0E0E0E] border-1 border-basic-gray rounded-base transition-colors hover:border-basic-yellow">
      <div className="relative w-[25rem] aspect-square">
        <div
          className="w-full h-full relative rounded-base overflow-hidden"
        >
          <div className="absolute inset-0 z-0 blur-lg">
            {item?.icon_url && (
              <Image className="object-contain scale-80" src={item.icon_url} alt="" fill sizes="100%" unoptimized />
            )}
          </div>

          <Image
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 aspect-square object-cover z-10"
            src={item?.icon_url || 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/lottery/img_pool_test.png'}
            alt=""
            width={1}
            height={1}
            unoptimized
            priority
          />
        </div>

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

            <span>Close in {limitedTime}</span>
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

            <span>Limited Qty : {item?.limited_rewards?.length || 0}</span>
          </div>
        </div>

        <div className="absolute top-[13%] left-[3.5%]">
          <div className="flex items-center px-[1.125rem] py-2 bg-white/20 rounded-five text-sm leading-none">
            <span className="text-basic-yellow">
              {item?.open_status ? LotteryStatusConfig[item.open_status].label || '--' : '--'}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 text-white text-xl leading-6">{item?.name || '--'}</div>

      <div className="grid auto-cols-max place-content-start gap-x-4 gap-y-5 mt-6 flex-1">
        {(item?.limited_rewards || []).map((reward, index) => (
          <div key={index} className="flex items-center h-min">
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
        <BattlePass item={item} />

        <Link href={`/lottery/${item?.lottery_pool_id}`} target="_blank">
          <LGButton className="w-[8.75rem]" label="Play" />
        </Link>
      </div>
    </div>
  );
};

export default PoolCard;
