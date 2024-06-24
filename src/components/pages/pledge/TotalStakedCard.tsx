import { cn } from '@nextui-org/react';
import Image from 'next/image';
import { FC } from 'react';

interface StakeItemProps {
  locked?: boolean;
  value: string;
  unit: string;
}

const StakeItem: FC<StakeItemProps & ClassNameProps> = ({ className, locked, value, unit }) => {
  return (
    <div
      className={cn([
        'relative z-0 w-[20.5rem] h-[5.8125rem] flex items-center',
        locked ? 'pl-[2.125rem]' : 'pl-5',
        className,
      ])}
    >
      <Image
        className="object-contain"
        src={`https://moonveil-public.s3.ap-southeast-2.amazonaws.com/pledge/icons/icon_${
          locked ? 'lock' : 'unlock'
        }.png`}
        alt=""
        width={locked ? 39 : 52}
        height={locked ? 50 : 49}
        unoptimized
      />

      <div className="flex flex-col gap-y-8 leading-none ml-5">
        <div>{locked ? 'Locked' : 'Unlocked'} Stake:</div>

        <div className="flex items-end gap-x-2 text-[#EBDDB6] font-semakin">
          <div className="text-[2.5rem] leading-[1.5rem]">{value || '--'}</div>
          <div className="text-2xl leading-4">{unit}</div>
        </div>
      </div>
    </div>
  );
};

const TotalStakedCard: FC = () => {
  return (
    <div className="w-full aspect-[1408/121] relative mt-6 flex items-center py-ten pl-[2.375rem] pr-[1.125rem]">
      <Image
        className="object-contain"
        src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/pledge/bg_total_staked.png"
        alt=""
        fill
        sizes="100%"
        unoptimized
      />

      <Image
        className="w-[3.1875rem] relative z-0"
        src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/pledge/icons/icon_eth.png"
        alt=""
        width={51}
        height={83}
        unoptimized
      />

      <div className="font-semibold relative z-0 flex flex-col justify-between gap-y-2 ml-9 flex-1">
        <div className="text-[#3D3D3D]">Your total staked:</div>

        <div className="flex items-end font-semakin text-black leading-none">
          <div className="text-[4rem]">2000</div>
          <div className="text-2xl leading-10 ml-4">ETH</div>
        </div>
      </div>

      <StakeItem locked={false} value="1000" unit="ETH" />

      <StakeItem className="ml-3" locked value="1000" unit="ETH" />
    </div>
  );
};

export default TotalStakedCard;
