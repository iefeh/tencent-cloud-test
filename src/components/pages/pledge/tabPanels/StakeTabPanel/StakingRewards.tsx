import Image from 'next/image';
import { FC } from 'react';

const StakingRewards: FC = () => {
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

      <div></div>
    </>
  );
};

export default StakingRewards;
