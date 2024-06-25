import StepInput from '@/components/common/inputs/StepInput';
import Image from 'next/image';
import { FC } from 'react';
import StakingRewards from './StakingRewards';
import LGButton from '@/pages/components/common/buttons/LGButton';

const StakeTabPanel: FC = () => {
  return (
    <div className="px-16 flex flex-col items-center">
      <div className="flex justify-between gap-x-36">
        <StepInput title="Add Eth" nodeType="process" nodes={5} total={5000} appendLabel="ETH" />

        <StepInput title="Duration" nodeType="button" nodes={[]} />
      </div>

      <StakingRewards />

      <LGButton className="uppercase w-[14.375rem] h-[3.1875rem] text-xl font-semibold mt-24" label="Stake" actived />
    </div>
  );
};

export default StakeTabPanel;
