import { cn } from '@nextui-org/react';
import Image from 'next/image';
import { FC } from 'react';
import astronautImg from 'img/loyalty/season/astronaut.png';

interface Props {
  className?: string;
}

const Astronaut: FC<Props> = ({ className }) => {
  return (
    <div className={cn(['relative animate-float3', className])}>
      <Image className="object-contain" src={astronautImg} alt="" fill sizes="100%" />
    </div>
  );
};

export default Astronaut;
