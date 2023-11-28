import arrowImg from 'img/astrark/arrow.png';
import Image from 'next/image';
import styles from './index.module.css';

export default function ScrollDownArrow() {
  return (
    <div
      className={
        'absolute left-1/2 -translate-x-1/2 bottom-[4.5625rem] z-20 flex flex-col items-center ' + styles.arrowImg
      }
    >
      <div className="font-decima text-basic-yellow mb-2">Scroll Down</div>
      <Image className="w-[3.1875rem] h-[1.75rem]" src={arrowImg} alt="" />
    </div>
  );
}
