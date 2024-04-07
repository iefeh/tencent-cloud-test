import { FC } from 'react';
import BattlePass from '../../BattlePass';
import PremiumPass from '../../PremiumPass';
import RuleButton from '../../RuleButton';

interface Props {
  visible?: boolean;
  onRuleClick?: () => void;
}

const FloatParts: FC<Props> = ({ visible, onRuleClick }) => {
  return (
    <>
      <BattlePass className="!absolute left-16 bottom-16" visible={visible} float onRuleClick={onRuleClick} />

      <PremiumPass className="!absolute right-16 bottom-48" visible={visible} />

      <RuleButton className="!absolute right-16 bottom-16" visible={visible} onRuleClick={onRuleClick} />
    </>
  );
};

export default FloatParts;
