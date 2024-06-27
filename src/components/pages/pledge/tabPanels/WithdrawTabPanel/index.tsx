import StepInput from '@/components/common/inputs/StepInput';
import LGButton from '@/pages/components/common/buttons/LGButton';
import { FC } from 'react';

const WithdrawTabPanel: FC = () => {
  return (
    <div className="mt-[4.375rem] px-[4.5rem]">
      <div className="flex flex-col items-center w-[35rem] mx-auto">
        <StepInput title="Add Eth" nodeType="process" nodes={5} total={5000} appendLabel="ETH" />

        <LGButton className="uppercase text-xl font-semibold mt-[4.8125rem]" label="Withdraw" actived />
      </div>
    </div>
  );
};

export default WithdrawTabPanel;
