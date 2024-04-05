import { cn } from '@nextui-org/react';
import Image from 'next/image';
import { FC } from 'react';
import planetoidImg from 'img/loyalty/season/planetoid.png';

interface Props {
  className?: string;
}

const Planetoid: FC<Props> = ({ className }) => {
  return (
    <div className={cn(['relative', className])}>
      <Image className="object-contain" src={planetoidImg} alt="" fill sizes="100%" />
    </div>
  );
};

export default Planetoid;
