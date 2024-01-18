import Image, { StaticImageData } from 'next/image';
import plusImg from 'img/profile/plus.png';
import { cn } from '@nextui-org/react';

interface BasicBadgeProps {
  src?: string | StaticImageData;
}

export default function BasicBadge(props: BasicBadgeProps) {
  const { src } = props;

  return (
    <div
      className={cn([
        'inline-flex justify-center items-center w-[6.25rem] h-[6.25rem] relative bg-black shrink-0',
        src || 'border-1 border-basic-gray rounded-base',
      ])}
    >
      <div className={cn(['relative', src ? 'w-full h-full' : 'w-[1.5625rem] h-[1.5625rem]'])}>
        <Image src={src || plusImg} alt="" fill />
      </div>
    </div>
  );
}
