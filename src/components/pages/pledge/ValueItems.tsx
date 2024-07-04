import { FC } from 'react';
import ValueItem from './ValueItem';
import { usePledgeContext } from '@/store/Pledge';
import { observer } from 'mobx-react-lite';
import usePledge from '@/hooks/pages/pledge/usePledge';

const ValueItems: FC = () => {
  const { poolsTotalValue, stakeInfo } = usePledgeContext();

  return (
    <div className="flex justify-center items-center mt-5 gap-[6.5rem]">
      {stakeInfo.length > 0 && (
        <ValueItem
          icon="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/pledge/icon_locked_value.png"
          label="My Staking Points"
          value={stakeInfo[2]?.toLocaleString('en') || '-'}
        />
      )}

      <ValueItem
        icon="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/pledge/icon_locked_value.png"
        label="Total Staked Value"
        value={`$${poolsTotalValue || '-'}`}
        labelTips="This is the current total staked value of all staking pools."
      />
    </div>
  );
};

export default observer(ValueItems);
