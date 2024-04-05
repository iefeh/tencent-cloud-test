import { FC } from 'react';
import BattlePass from '../../BattlePass';
import PremiumPass from '../../PremiumPass';

const FloatParts: FC = () => {
  return (
    <>
      <BattlePass className="!absolute left-16 bottom-16" />

      <PremiumPass className="!absolute right-16 bottom-16" />
    </>
  );
};

export default FloatParts;
