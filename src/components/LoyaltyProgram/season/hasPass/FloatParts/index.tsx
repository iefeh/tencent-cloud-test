import { FC } from 'react';
import BattlePass from '../../BattlePass';
import PremiumPass from '../../PremiumPass';
import RuleButton from '../../RuleButton';
import { cn } from '@nextui-org/react';

interface Props {
  visible?: boolean;
  onRuleClick?: () => void;
}

const FloatParts: FC<Props> = ({ visible, onRuleClick }) => {
  return (
    <>
      <BattlePass
        className={cn(['!absolute left-16 bottom-16', visible || 'opacity-0'])}
        visible={visible}
        float
        onRuleClick={onRuleClick}
      />

      <PremiumPass className={cn(['!absolute right-32 bottom-48', visible || 'opacity-0'])} visible={visible} />

      <RuleButton
        className={cn(['!absolute right-16 bottom-16', visible || 'opacity-0'])}
        visible={visible}
        onRuleClick={onRuleClick}
      />
    </>
  );
};

export default FloatParts;
