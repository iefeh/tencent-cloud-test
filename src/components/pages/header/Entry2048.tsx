import { GAME_URL_2048 } from '@/constant/2048';
import { cn } from '@nextui-org/react';
import Image from 'next/image';
import { FC } from 'react';

const Entry2048: FC = () => {
  const chars = [
    {
      url: 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/common/2048/2.png',
      width: 186,
      height: 211,
    },
    {
      url: 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/common/2048/0.png',
      width: 187,
      height: 211,
    },
    {
      url: 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/common/2048/4.png',
      width: 186,
      height: 209,
    },
    {
      url: 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/common/2048/8.png',
      width: 190,
      height: 210,
    },
  ];

  function onJump() {
    window.open(GAME_URL_2048);
  }

  return (
    <div className="relative cursor-pointer hidden xl:block" onClick={onJump}>
      <div className="relative w-[7.0625rem] h-[2.875rem]">
        <Image
          className="object-contain"
          src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/common/2048/puffy.png"
          alt=""
          fill
          sizes="100%"
          unoptimized
        />
      </div>

      <div className="ani-jog absolute bottom-0 left-1/2 -translate-x-[54%] translate-y-[68%] w-max">
        <div className="word flex items-center">
          {chars.map(({ url, width, height }, index) => (
            <div
              key={index}
              className={cn(['char relative', index > 0 && '-ml-[0.375rem]'])}
              style={{ width: `${width / 16 / 5}rem`, height: `${height / 16 / 5}rem` }}
            >
              <Image className="object-contain" src={url} alt="" fill sizes="100%" unoptimized />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Entry2048;
