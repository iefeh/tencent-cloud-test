import { FC } from 'react';
import ValueItem from './ValueItem';
import { usePledgeContext } from '@/store/Pledge';
import { observer } from 'mobx-react-lite';

const ValueItems: FC = () => {
  const { poolsTotalValue, stakeInfo, totalStakingPoints } = usePledgeContext();

  return (
    <div className="flex justify-center items-center mt-5 gap-[6.5rem]">
      {stakeInfo.length > 0 && (
        <ValueItem
          icon="https://d3dhz6pjw7pz9d.cloudfront.net/pledge/icon_locked_value.png"
          label="My Staking Points"
          value={Number(totalStakingPoints).toLocaleString('en') || '-'}
        />
      )}

      <ValueItem
        icon="https://d3dhz6pjw7pz9d.cloudfront.net/pledge/icon_locked_value.png"
        label="Total Staked Value"
        value={`$${poolsTotalValue || '-'}`}
        labelTips="This is the current total staked value of all staking pools."
      />
    </div>
  );
};

export default observer(ValueItems);
