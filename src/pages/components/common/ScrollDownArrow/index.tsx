import arrowImg from 'img/astrark/arrow.png';
import Image, { StaticImageData } from 'next/image';
import styles from './index.module.css';
import { cn } from '@nextui-org/react';

interface Props {
  className?: string;
  icon?: string | StaticImageData;
}

export default function ScrollDownArrow(props: Props) {
  const { icon, className } = props;

  return (
    <div
      className={cn([
        'absolute left-1/2 -translate-x-1/2 bottom-[4.5625rem] z-20 flex flex-col items-center text-basic-yellow',
        styles.arrowImg,
        className,
      ])}
    >
      <div className="font-decima mb-2">Scroll Down</div>
      <Image className="w-[3.1875rem] h-[1.75rem]" src={icon || arrowImg} alt="" />
    </div>
  );
}
