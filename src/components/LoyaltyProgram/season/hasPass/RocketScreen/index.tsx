import Image from 'next/image';
import { FC } from 'react';
import rocketImg from 'img/loyalty/season/rocket.png';

const RocketScreen: FC = () => {
  return (
    <div className="oppo-box w-full relative z-10 flex flex-col justify-center items-center">
      <Image className="w-[3.75rem] h-[19.3125rem] object-contain" src={rocketImg} alt="" />
    </div>
  );
};

export default RocketScreen;
