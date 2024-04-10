import { cn, useDisclosure } from '@nextui-org/react';
import { FC, useState } from 'react';
import styles from './index.module.css';
import Image from 'next/image';
import opMoonImg from 'img/loyalty/season/moon_op.png';
import FinalReward from '../../FinalReward';
import Orbit from '@/components/common/Orbit';
import starImg from 'img/loyalty/season/orbit_star.png';
import Planetoid from '../../Planetoid';
import Astronaut from '../../Astronaut';
import { useBattlePassContext } from '@/store/BattlePass';
import { observer } from 'mobx-react-lite';
import RewardModal from '../../RewardModal';
import { BattlePassLevelDTO } from '@/http/services/battlepass';

const FinalScreen: FC = () => {
  const { hasAcheivedFinalPass } = useBattlePassContext();
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const [currentItem, setCurrentItem] = useState<BattlePassLevelDTO | undefined>();

  function onItemClick(item?: BattlePassLevelDTO) {
    setCurrentItem(item);
    if (!!item) onOpen();
  }

  function onCloseCallback() {
    onClose();
    setCurrentItem(undefined);
  }

  const starImgNode = <Image className="w-7 h-7" src={starImg} alt="" />;

  return (
    <div className="oppo-box w-full pb-28 relative z-10 bg-[url('/img/loyalty/season/bg_moon.png')] bg-[length:69rem_53rem] bg-center bg-no-repeat overflow-x-hidden overflow-y-visible">
      <div className="absolute top-[calc(50%_+_0.5rem)] left-[calc(50%_+_0.8rem)] -translate-x-1/2 -translate-y-1/2 z-0">
        <Orbit
          className="!absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0"
          isCircle
          scale={44}
          defaultDeg={-20}
          speed={4}
          star={starImgNode}
        />

        <Orbit
          className="!absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0"
          isCircle
          scale={52}
          defaultDeg={12}
          speed={3}
          antiClock
          star={starImgNode}
        />

        <Orbit
          className="!absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0"
          isCircle
          scale={63}
          defaultDeg={-45}
          speed={1.5}
          star={starImgNode}
        />
      </div>

      <div className="relative z-0 w-full h-screen flex flex-col justify-center items-center">
        <div
          className={cn([
            'font-semakin text-[6.25rem] text-transparent leading-none relative z-0',
            hasAcheivedFinalPass ? 'visible' : 'invisible',
            styles.strokeText,
          ])}
          data-text="Congratulations!"
        >
          Congratulations!
        </div>

        <div
          className={cn([
            'mt-12 font-decima text-lg max-w-[35rem] text-center relative z-0',
            hasAcheivedFinalPass ? 'visible' : 'invisible',
          ])}
        >
          Congratulations on completing all the tasks and reaching the highest level this season! Thank you for your
          hard work and support. We will soon be releasing new content, so stay tuned!
        </div>

        <div className="relative z-0">
          <Image className="w-[3.75rem] h-8 object-contain mt-[5.5rem]" src={opMoonImg} alt="" />

          <FinalReward
            className="!absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-full"
            onItemClick={onItemClick}
          />
        </div>
      </div>

      <Planetoid className="!absolute w-[5.4375rem] h-[7.9375rem] left-[18.4375rem] top-[16.625rem]" />

      <Astronaut className="!absolute right-[21.6875rem] top-[45.625rem] w-[11.8125rem] h-[13.5625rem]" />

      {currentItem && (
        <RewardModal item={currentItem} isOpen={isOpen} onOpenChange={onOpenChange} onClose={onCloseCallback} />
      )}
    </div>
  );
};

export default observer(FinalScreen);
