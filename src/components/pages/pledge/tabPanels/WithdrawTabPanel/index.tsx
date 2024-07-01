import StepInput from '@/components/common/inputs/StepInput';
import LGButton from '@/pages/components/common/buttons/LGButton';
import { usePledgeContext } from '@/store/Pledge';
import { FC, useState } from 'react';
import { toast } from 'react-toastify';

interface Props {
  poolKey: string;
}

const WithdrawTabPanel: FC<Props> = ({ poolKey }) => {
  const [withdrawValue, setWithdrawValue] = useState('');
  const { stakeInfo } = usePledgeContext();

  return (
    <div className="mt-[4.375rem] px-[4.5rem]">
      <div className="flex flex-col items-center w-[35rem] mx-auto">
        <StepInput
          value={withdrawValue}
          title={`Withdraw ${poolKey}`}
          caption={
            <div className="font-poppins font-semibold">
              Balance <span className="text-basic-yellow">{stakeInfo[3] || 0}</span>{' '}
              <span className="uppercase">{poolKey}</span>
            </div>
          }
          nodeType="progress"
          nodes={5}
          total={+(stakeInfo[3] || 0)}
          appendLabel={poolKey}
          onValueChange={setWithdrawValue}
        />

        <LGButton
          className="uppercase text-xl font-semibold mt-[4.8125rem]"
          label="Withdraw"
          actived
          disabled={+withdrawValue <= 0}
          onClick={() => toast.info('Coming Soon.')}
        />
      </div>
    </div>
  );
};

export default WithdrawTabPanel;
