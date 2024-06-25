import StepInput from '@/components/common/inputs/StepInput';
import Image from 'next/image';
import { FC } from 'react';
import StakingRewards from './StakingRewards';

const StakeTabPanel: FC = () => {
  return (
    <div className="px-16">
      <div className="flex justify-between gap-x-36">
        <StepInput title="Add Eth" nodeType="process" nodes={5} total={5000} appendLabel="ETH" />

        <StepInput title="Duration" nodeType="button" nodes={[]} />
      </div>

      <StakingRewards />
    </div>
  );
};

export default StakeTabPanel;
