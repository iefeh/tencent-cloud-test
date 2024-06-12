import { FC, useEffect, useState } from 'react';
import Step from './Step';
import { useBattlePassContext } from '@/store/BattlePass';
import PrefixStep from './PrefixStep';
import { observer } from 'mobx-react-lite';
import { BattlePassLevelDTO } from '@/http/services/battlepass';

interface Props {
  onItemClick?: (item?: BattlePassLevelDTO) => void;
  onRuleClick?: () => void;
}

const Ladder: FC<Props> = ({ onItemClick, onRuleClick }) => {
  const { info, progressInfo } = useBattlePassContext();
  const { totalProgress } = progressInfo || {};
  const { standard_pass, premium_pass } = info || {};
  return (
    <div className="relative z-0 flex flex-col-reverse gap-y-72">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-ten h-full border-1 border-white/20">
        <div
          className="absolute -left-1px bottom-0 w-ten bg-basic-yellow"
          style={{ height: `${totalProgress * 100}%` }}
        ></div>
      </div>

      <div className="relative w-0 h-0 z-0">
        <PrefixStep className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" onRuleClick={onRuleClick} />
      </div>

      {(standard_pass || []).map((starndardItem, index) => (
        <div key={index} className="relative w-0 h-0 z-0">
          <Step
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            isFinal={index === (standard_pass?.length || 0) - 1}
            standardItem={starndardItem}
            premiumItem={premium_pass?.[index]}
            onItemClick={onItemClick}
          />
        </div>
      ))}
    </div>
  );
};

export default observer(Ladder);
