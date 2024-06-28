import Image from 'next/image';
import { FC } from 'react';

interface Props extends ClassNameProps {
  content?: string;
}

const EmptyContent: FC<Props> = ({ className, content = 'No history found.' }) => {
  return (
    <div className="absolute inset-0 backdrop-saturate-150 backdrop-blur-md bg-overlay/30 z-[999] flex flex-col justify-center items-center font-poppins text-2xl pointer-events-none">
      <p className="px-4 mt-4 text-center" dangerouslySetInnerHTML={{ __html: content }}></p>

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
