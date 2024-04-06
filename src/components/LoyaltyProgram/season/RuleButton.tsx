import BasicButton from '@/pages/components/common/BasicButton';
import { Tooltip, cn } from '@nextui-org/react';
import { FC } from 'react';
import WarningSVG from 'svg/warning.svg';

interface Props {
  className?: string;
  onRuleClick?: () => void;
}

const RuleButton: FC<Props> = ({ className, onRuleClick }) => {
  return (
    <div className={cn(['flex items-center', className])}>
      <Tooltip
        content={
          <div className="max-w-[24.25rem] p-4 border-1 border-[#2A2A2A] rounded-base">
            Level up your season Pass by joining our tasks and events to unlock more exciting rewards!
          </div>
        }
      >
        <div>
          <WarningSVG className="fill-white w-6 h-6 mr-ten" />
        </div>
      </Tooltip>

      <BasicButton label="Rule" onClick={onRuleClick} />
    </div>
  );
};

export default RuleButton;
