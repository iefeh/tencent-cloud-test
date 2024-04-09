import Image from 'next/image';
import { FC } from 'react';
import bgImg from 'img/common/battlepass/bg_nopass_index.png';

const BGScreen: FC = () => {
  return (
    <div className="absolute inset-0 z-0">
      <Image className="object-cover bg-top" src={bgImg} alt="" fill sizes="100%" />
    </div>
  );
};

export default BGScreen;
