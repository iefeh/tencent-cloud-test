import Image from 'next/image';
import { FC } from 'react';
import earthBgImg from 'img/common/battlepass/bg_index_earth.png';
import LGButton from '@/pages/components/common/buttons/LGButton';
import styles from './index.module.css';
import DoubleArrowLeftSVG from 'svg/arrow_double_left.svg';
import { cn } from '@nextui-org/react';
import Orbit from '@/components/common/Orbit';
import starImg from 'img/loyalty/season/orbit_star.png';
import Astronaut from '../../Astronaut';
import Planetoid from '../../Planetoid';
import { useBattlePassContext } from '@/store/BattlePass';
import CircularLoading from '@/pages/components/common/CircularLoading';

interface Props {
  loading?: boolean;
  onExplore?: () => void;
}

const IndexScreen: FC<Props> = ({ loading, onExplore }) => {
  const { info } = useBattlePassContext();
  const starNode = <Image className="w-7 h-7" src={starImg} alt="" />;

  return (
    <div className="oppo-box w-full h-screen relative z-10 flex justify-center items-center">
      <div className="w-full h-[44.1875rem] absolute left-0 bottom-0">
        <Image className="object-contain bg-bottom" src={earthBgImg} alt="" fill sizes="100%" />
      </div>

      <Orbit
        className="!absolute top-[12rem] left-1/2 -translate-x-1/2 z-0"
        scale={150}
        defaultDeg={-20}
        speed={1.2}
        sinkTime={3000}
        star={starNode}
      />

      <Orbit
        className="!absolute top-[4rem] left-1/2 -translate-x-1/2 z-0"
        scale={160}
        defaultDeg={12}
        speed={0.8}
        sinkTime={5000}
        antiClock
        star={starNode}
      />

      <Orbit
        className="!absolute -top-[4rem] left-1/2 -translate-x-1/2 z-0"
        scale={170}
        defaultDeg={-36}
        speed={0.4}
        sinkTime={8000}
        star={starNode}
      />

      <Astronaut className="!absolute right-[4.6875rem] bottom-[33.1875rem] w-[11.8125rem] h-[13.5625rem]" />

      <Planetoid className="!absolute left-40 bottom-[44.5rem] w-[5.4375rem] h-[7.9375rem]" />

      <div className="font-semakin text-[9.375rem] text-transparent relative z-0">
        <div className={styles.strokeText} data-text="Rock’it">
          Rock’it
        </div>
        <div className={styles.strokeText} data-text="To the Moon">
          To the Moon
        </div>
      </div>

      {info && (
        <div className={cn(['w-[7.5rem] h-[7.5rem]', 'absolute left-1/2 top-24 -translate-x-1/2'])}>
          <LGButton
            className={cn([
              'w-full h-full text-base font-semakin leading-5 rounded-full',
              "!bg-[url('/img/loyalty/season/btn_circle.png')] bg-contain bg-no-repeat",
              '[&>div]:whitespace-normal [&>div]:flex-col',
              // 'shadow-[0_0_2rem_0.5rem] shadow-basic-yellow',
              'shadow-basic-yellow animate-breathShadow',
            ])}
            label="Explore Now"
            actived
            prefix={<DoubleArrowLeftSVG className="w-4 h-4 mx-auto rotate-90 font-bold mb-1" />}
            onClick={onExplore}
          />

          {loading && <CircularLoading noBlur loadingText="" />}
        </div>
      )}
    </div>
  );
};

export default IndexScreen;
