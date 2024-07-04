import StepInput from '@/components/common/inputs/StepInput';
import LGButton from '@/pages/components/common/buttons/LGButton';
import { usePledgeContext } from '@/store/Pledge';
import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers/react';
import { FC, useState } from 'react';
import { toast } from 'react-toastify';

interface Props {
  poolKey: string;
}

const WithdrawTabPanel: FC<Props> = ({ poolKey }) => {
  const [withdrawValue, setWithdrawValue] = useState('');
  const { stakeInfo, withdraw, refresh, formatUnits } = usePledgeContext();
  const [loading, setLoading] = useState(false);
  const { walletProvider } = useWeb3ModalProvider();
  const { address } = useWeb3ModalAccount();

  async function onWithdraw() {
    setLoading(true);

    const res = await withdraw(walletProvider!, withdrawValue);
    if (res) {
      toast.success(`You have successfully withdrawed ${withdrawValue} ${poolKey}.`);
      setWithdrawValue('');
      refresh(walletProvider!, address!);
    }

    setLoading(false);
  }

  return (
    <div className="mt-[4.375rem] px-[4.5rem]">
      <div className="flex flex-col items-center w-[35rem] mx-auto">
        <StepInput
          value={withdrawValue}
          title={`Withdraw ${poolKey}`}
          caption={
            <div className="font-poppins font-semibold">
              Balance <span className="text-basic-yellow">{formatUnits(stakeInfo[3] || 0n)}</span>{' '}
              <span className="uppercase">{poolKey}</span>
            </div>
          }
          nodeType="progress"
          nodes={5}
          total={+formatUnits(stakeInfo[3] || 0n)}
          appendLabel={poolKey}
          onValueChange={setWithdrawValue}
        />

        <LGButton
          className="uppercase text-xl font-semibold mt-[4.8125rem]"
          label="Withdraw"
          actived
          disabled={+withdrawValue <= 0}
          loading={loading}
          onClick={onWithdraw}
        />
      </div>
    </div>
  );
};

export default WithdrawTabPanel;
