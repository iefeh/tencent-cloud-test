import { FC } from 'react';
import Ladder from '../../Ladder';
import FinalReward from '../../FinalReward';
import { useBattlePassContext } from '@/store/BattlePass';
import { observer } from 'mobx-react-lite';
import { cn } from '@nextui-org/react';

const RocketScreen: FC = () => {
  const { hasAcheivedFinalPass } = useBattlePassContext();

  return (
    <div
      className={cn([
        'oppo-box w-full relative z-10 flex flex-col justify-center items-center',
        hasAcheivedFinalPass ? 'mt-[19rem]' : 'mt-60',
      ])}
    >
      {hasAcheivedFinalPass || <FinalReward className="mb-16 mt-60" />}

      <Ladder />
    </div>
  );
};

export default observer(RocketScreen);
