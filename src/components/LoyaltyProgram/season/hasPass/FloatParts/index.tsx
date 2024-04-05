import { FC } from 'react';
import BattlePass from '../../BattlePass';
import FinalReward from '../../FinalReward';

const FloatParts: FC = () => {
  return (
    <>
      <BattlePass className="!absolute left-16 bottom-16" />

      <FinalReward className="!absolute right-16 bottom-16" />
    </>
  );
};

export default FloatParts;
