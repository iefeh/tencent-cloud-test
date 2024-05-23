import Image from 'next/image';
import { FC } from 'react';

const EmptyContent: FC<ClassNameProps> = ({ className }) => {
  return (
    <div className="absolute inset-0 backdrop-saturate-150 backdrop-blur-md bg-overlay/30 z-[999] flex flex-col justify-center items-center font-poppins text-2xl">
      <p>No history found.</p>

      <Image
        className="w-4/5 h-auto"
        src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/common/teams.png"
        alt=""
        width={3928}
        height={1898}
        unoptimized
      />
    </div>
  );
};

export default EmptyContent;
