import { Tooltip } from '@nextui-org/react';
import Image, { type StaticImageData } from 'next/image';
import { FC } from 'react';

interface Props {
  icon: string | StaticImageData;
  label: string;
  labelTips?: string;
  value: string | number;
}

const ValueItem: FC<Props> = ({ icon, label, value, labelTips }) => {
  return (
    <div className="flex items-center">
      <Image
        className="w-[3.125rem] h-[3.125rem] object-contain mr-4"
        src={icon}
        alt=""
        width={50}
        height={50}
        unoptimized
      />

      <div className="font-semakin">
        <div className="text-5xl text-[#EBDDB6]">{value}</div>
        <div className="text-transparent text-sm leading-none bg-clip-text bg-gradient-to-r from-[#8C7056] to-[#DAA96F] inline-flex items-center gap-2">
          {label}
          <Tooltip
            content={
              <div className="max-w-[25rem]">This is the current total staked value of all staking pools.</div>
            }
          >
            <Image
              className="w-[1.0625rem] h-[1.0625rem] object-contain relative -top-1px"
              src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/pledge/icons/icon_info_small.png"
              alt=""
              width={17}
              height={17}
              unoptimized
            />
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default ValueItem;
