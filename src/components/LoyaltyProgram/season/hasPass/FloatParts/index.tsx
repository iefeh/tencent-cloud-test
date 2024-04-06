import { FC } from 'react';
import BattlePass from '../../BattlePass';
import PremiumPass from '../../PremiumPass';
import RuleButton from '../../RuleButton';

interface Props {
  onRuleClick?: () => void;
}

const FloatParts: FC<Props> = ({ onRuleClick }) => {
  return (
    <>
      <BattlePass className="!absolute left-16 bottom-16" onRuleClick={onRuleClick} />

      <PremiumPass className="!absolute right-16 bottom-48" />

      <RuleButton className="!absolute right-16 bottom-16" onRuleClick={onRuleClick} />
    </>
  );
};

export default FloatParts;
