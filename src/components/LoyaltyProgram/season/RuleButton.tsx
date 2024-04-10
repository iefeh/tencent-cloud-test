import BasicButton from '@/pages/components/common/BasicButton';
import { Tooltip, cn } from '@nextui-org/react';
import { FC, useRef } from 'react';
import { CSSTransition } from 'react-transition-group';
import WarningSVG from 'svg/warning.svg';

interface Props {
  className?: string;
  visible?: boolean;
  onRuleClick?: () => void;
}

const RuleButton: FC<Props> = ({ className, visible, onRuleClick }) => {
  const nodeRef = useRef<HTMLDivElement>(null);

  return (
    <CSSTransition in={visible} classNames="transition-fade-right" nodeRef={nodeRef} timeout={800}>
      <div ref={nodeRef} className={cn(['flex items-center gap-ten', className])}>
        <Tooltip
          classNames={{ content: 'p-4 border-1 border-[#2A2A2A] rounded-base' }}
          content={
            <div className="max-w-[24.25rem]">
              Level up your season Pass by joining our tasks and events to unlock more exciting rewards!
            </div>
          }
        >
          <div>
            <WarningSVG className="fill-white w-6 h-6" />
          </div>
        </Tooltip>

        <BasicButton label="Rule" onClick={onRuleClick} />
      </div>
    </CSSTransition>
  );
};

export default RuleButton;
