import { FC } from 'react';
import Ladder from '../../Ladder';
import FinalReward from '../../FinalReward';
import { useBattlePassContext } from '@/store/BattlePass';
import { observer } from 'mobx-react-lite';
import { cn } from '@nextui-org/react';
import Image from 'next/image';
import ufoImg from 'img/loyalty/season/ufo.png';
import rocksImg from 'img/loyalty/season/rocks.png';
import halfPlanetImg from 'img/loyalty/season/half_planet.png';
import satelliteImg from 'img/loyalty/season/satellite.png';
import Planetoid from '../../Planetoid';

const RocketScreen: FC = () => {
  const { hasAcheivedFinalPass } = useBattlePassContext();

  return (
    <div
      className={cn([
        'oppo-box w-full relative z-10 flex flex-col justify-center items-center',
        hasAcheivedFinalPass ? 'mt-[19rem]' : 'mt-60',
      ])}
    >
      <div className="w-[21.125rem] h-[32.6875rem] absolute left-0 bottom-[52.3125rem]">
        <Image className="object-contain" src={halfPlanetImg} alt="" fill sizes="100%" />
      </div>

      <div className="w-[12.375rem] h-[13.3125rem] absolute left-[21.5rem] bottom-[90rem]">
        <Image className="object-contain" src={rocksImg} alt="" fill sizes="100%" />
      </div>

      <div className="w-[35.625rem] h-[14.625rem] absolute right-0 bottom-[119rem]">
        <Image className="object-contain" src={ufoImg} alt="" fill sizes="100%" />
      </div>

      <div className="w-[20.75rem] h-[13rem] absolute right-[8.5rem] bottom-[164rem]">
        <Image className="object-contain" src={satelliteImg} alt="" fill sizes="100%" />
      </div>

      <Planetoid className="w-[5.4375rem] h-[7.9375rem] !absolute right-[24.6875rem] bottom-[136rem]" />

      <Planetoid className="w-[5.4375rem] h-[7.9375rem] !absolute left-40 bottom-[36rem]" />

      {hasAcheivedFinalPass || <FinalReward className="mb-16 mt-60" />}

      <Ladder />
    </div>
  );
};

export default observer(RocketScreen);
