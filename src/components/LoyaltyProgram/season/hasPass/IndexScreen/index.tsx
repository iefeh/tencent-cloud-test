import Image from 'next/image';
import { FC } from 'react';
import earthBgImg from 'img/common/battlepass/bg_index_earth.png';
import LGButton from '@/pages/components/common/buttons/LGButton';
import ArrowRightSVG from 'svg/arrow_right.svg';
import styles from './index.module.css';
import DoubleArrowLeftSVG from 'svg/arrow_double_left.svg';
import { cn } from '@nextui-org/react';

interface Props {
  onExplore?: () => void;
}

const IndexScreen: FC<Props> = ({ onExplore }) => {
  return (
    <div className="oppo-box w-full h-screen relative z-10 flex justify-center items-center">
      <Image className="object-contain bg-bottom" src={earthBgImg} alt="" fill sizes="100%" />

      <div className="font-semakin text-[9.375rem] text-transparent relative z-0">
        <div className={styles.strokeText} data-text="Rock’it">
          Rock’it
        </div>
        <div className={styles.strokeText} data-text="To the Moon">
          To the Moon
        </div>
      </div>

      <LGButton
        className="absolute bottom-10 left-1/2 -translate-x-1/2 uppercase"
        label="Tasks"
        actived
        suffix={<ArrowRightSVG className="w-7 h-7" />}
      />

      <LGButton
        className={cn([
          'w-[7.5rem] h-[7.5rem] text-base font-semakin leading-5',
          'absolute left-1/2 top-24 -translate-x-1/2',
          "!bg-[url('/img/loyalty/season/btn_circle.png')] bg-contain bg-no-repeat",
          '[&>div]:whitespace-normal [&>div]:flex-col',
        ])}
        label="Explore Now"
        actived
        prefix={<DoubleArrowLeftSVG className="w-4 h-4 mx-auto rotate-90 font-bold mb-1" />}
        onClick={onExplore}
      />
    </div>
  );
};

export default IndexScreen;
