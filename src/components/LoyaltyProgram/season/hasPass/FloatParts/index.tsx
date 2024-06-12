import { FC } from 'react';
import BattlePass from '../../BattlePass';
import PremiumPass from '../../PremiumPass';
import RuleButton from '../../RuleButton';
import { cn } from '@nextui-org/react';
import { isMobile } from 'react-device-detect';

interface Props {
  visible?: boolean;
  onRuleClick?: () => void;
}

const FloatParts: FC<Props> = ({ visible, onRuleClick }) => {
  return (
    <>
      <BattlePass
        className={cn(['!absolute', isMobile ? 'left-8 bottom-24' : 'left-16 bottom-16', visible || 'invisible'])}
        visible={visible}
        float
        onRuleClick={onRuleClick}
      />

      {isMobile || (
        <PremiumPass className={cn(['!absolute right-32 bottom-48', visible || 'invisible'])} visible={visible} />
      )}

      <RuleButton
        className={cn(['!absolute', isMobile ? 'right-8 bottom-24' : 'right-16 bottom-16', visible || 'invisible'])}
        visible={visible}
        onRuleClick={onRuleClick}
      />
    </>
  );
};

export default FloatParts;
