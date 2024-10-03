import { LotteryBorders, LotteryStatus, LotteryStatusConfig, RewardQuality } from '@/constant/lottery';
import BattlePass from './BattlePass';
import LGButton from '@/pages/components/common/buttons/LGButton';
import { Lottery } from '@/types/lottery';
import Image from 'next/image';
import { FC } from 'react';
import dayjs from 'dayjs';
import Duration from 'dayjs/plugin/duration';
import Link from '@/components/link';
import { Button, Popover, PopoverContent, PopoverTrigger, Tooltip } from '@nextui-org/react';

dayjs.extend(Duration);

const DEFAULT_IMG = 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/lottery/img_pool_test.png';

const PoolCard: FC<ItemProps<Lottery.Pool>> = ({ item }) => {
  const {
    icon_frame_level,
    icon_url,
    open_status,
    user_meet_requirement = false,
    requirement_description,
  } = item || {};
  const border = LotteryBorders[(icon_frame_level || RewardQuality.COPPERY) as RewardQuality];
  const itemSize = '90%';
  const limitedTime = getLimitedTime();
  const isInProgress = open_status === LotteryStatus.IN_PROGRESS;
  const hasReachedRequirement = !!user_meet_requirement;
  const canPlay = open_status === LotteryStatus.IN_PROGRESS && hasReachedRequirement;
  const showStatus = open_status !== LotteryStatus.IN_PROGRESS && open_status !== LotteryStatus.ENDED;

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
        <div className="w-full h-full relative rounded-base overflow-hidden">
          <div className="absolute inset-0 z-0 blur-lg">
            <Image
              className="object-contain scale-80"
              src={icon_url || DEFAULT_IMG}
              alt=""
              fill
              sizes="100%"
              unoptimized
            />
          </div>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 aspect-square flex flex-col justify-center items-center origin-bottom-right rotate-[-15deg] bg-[#0E0E0E] rounded-3xl">
            <Image
              className="object-contain absolute left-0 bottom-0 z-0 max-w-none"
              src={border.img}
              style={{ width: `${border.width / 1.54}%`, height: `${border.height / 1.54}%` }}
              alt=""
              width={154}
              height={154}
              unoptimized
            />

            <div className="relative z-0" style={{ width: itemSize, height: itemSize }}>
              <Image className="object-contain " src={icon_url || DEFAULT_IMG} alt="" fill sizes="100%" unoptimized />
            </div>
          </div>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 aspect-square flex flex-col justify-center items-center origin-[50%_100%] rotate-12 bg-[#0E0E0E] rounded-3xl">
            <Image
              className="object-contain absolute left-0 bottom-0 z-0 max-w-none"
              src={border.img}
              style={{ width: `${border.width / 1.54}%`, height: `${border.height / 1.54}%` }}
              alt=""
              width={154}
              height={154}
              unoptimized
            />

            <div className="relative z-0" style={{ width: itemSize, height: itemSize }}>
              <Image
                className="object-contain "
                src={icon_url || 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/lottery/img_pool_test.png'}
                alt=""
                fill
                sizes="100%"
                unoptimized
              />
            </div>
          </div>
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

            <span className="whitespace-nowrap">Close in {limitedTime}</span>
          </div>

          {/* <div className="flex items-center pl-ten pr-4 pt-1 pb-[0.1875rem] bg-white/20 rounded-five text-sm leading-none">
            <Image
              className="w-6 h-6 object-contain mr-[0.375rem]"
              src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/lottery/icons/icon_qty.png"
              alt=""
              width={48}
              height={48}
              unoptimized
            />

            <span className='whitespace-nowrap'>Limited Reward Qty : {item?.limited_rewards?.length || 0}</span>
          </div> */}
        </div>

        {showStatus && (
          <div className="absolute top-[13%] left-[3.5%]">
            <div className="flex items-center px-[1.125rem] py-2 bg-white/20 rounded-five text-sm leading-none">
              <span className="text-basic-yellow">
                {item?.open_status ? LotteryStatusConfig[item.open_status].label || '--' : '--'}
              </span>
            </div>
          </div>
        )}
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

      <div className="flex justify-between items-center mt-6">
        <BattlePass item={item} />

        {hasReachedRequirement ? (
          <Link href={isInProgress ? `/draw/${item?.lottery_pool_id}` : ''}>
            <LGButton className="w-[8.75rem]" label="Draw" disabled={!canPlay} />
          </Link>
        ) : (
          <Popover placement="top">
            <PopoverTrigger>
              <Button
                className="w-[8.75rem] text-[#999] border-2 border-solid border-[#999] bg-transparent rounded-3xl h-auto px-6 py-1"
                disabled
              >
                Draw
              </Button>
            </PopoverTrigger>

            <PopoverContent>
              <div>
                <div className="text-lg">Please make sure you meet the following requirement(s) to enter:</div>
                <div className="indent-6 mt-2">· {requirement_description || '--'}</div>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
};

export default PoolCard;
