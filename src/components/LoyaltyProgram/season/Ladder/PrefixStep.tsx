import { cn } from '@nextui-org/react';
import { observer } from 'mobx-react-lite';
import Image from 'next/image';
import { FC } from 'react';
import acheviedLevelNodeImg from 'img/loyalty/season/level_node_achevied.png';
import BattlePass from '../BattlePass';
import { isMobile } from 'react-device-detect';

interface Props {
  className?: string;
  onRuleClick?: () => void;
}

const PrefixStep: FC<Props> = ({ className, onRuleClick }) => {
  return (
    <div className={cn(['flex justify-between items-center', className])}>
      {isMobile ? (
        <div className="w-16 flex justify-center">
          <div className="font-semakin text-3xl text-basic-yellow text-center">Premium Pass</div>
        </div>
      ) : (
        <BattlePass className="w-[11.0625rem]" onRuleClick={onRuleClick} />
      )}

      <div className={isMobile ? 'w-48' : 'w-[17.75rem]'}></div>

      <div className={cn(['flex justify-center', isMobile ? 'w-16' : 'w-[11.0625rem]'])}>
        <div
          className={cn(['font-semakin text-3xl text-basic-blue text-center', isMobile || 'w-max whitespace-nowrap'])}
        >
          Standard Pass
        </div>
      </div>

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[4.25rem] h-[4.25rem]">
        <Image className="object-contain" src={acheviedLevelNodeImg} alt="" fill sizes="100%" />
      </div>
    </div>
  );
};

export default observer(PrefixStep);
