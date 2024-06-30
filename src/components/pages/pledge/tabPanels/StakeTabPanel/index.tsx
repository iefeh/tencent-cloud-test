import StepInput from '@/components/common/inputs/StepInput';
import { FC, useEffect, useState } from 'react';
import StakingRewards from './StakingRewards';
import LGButton from '@/pages/components/common/buttons/LGButton';
import { usePledgeContext } from '@/store/Pledge';
import { observer } from 'mobx-react-lite';
import { useWeb3ModalProvider } from '@web3modal/ethers/react';
import useBalance from '@/hooks/wallet/useBalance';

interface Props {
  poolKey: string;
}

const StakeTabPanel: FC<Props> = ({ poolKey }) => {
  const [stakeValue, setStateValue] = useState('');
  const [duration, setDuration] = useState('');
  const [loading, setLoading] = useState(false);
  const { stake } = usePledgeContext();
  const { walletProvider } = useWeb3ModalProvider();
  const { balance } = useBalance();

  async function onStake() {
    setLoading(true);

    await stake(walletProvider!, +stakeValue, +duration);

    setLoading(false);
  }

  return (
    <div className="px-16 flex flex-col items-center">
      <div className="flex justify-between gap-x-36">
        <StepInput
          value={stakeValue}
          title={`Add ${poolKey}`}
          caption={
            <div className="font-poppins font-semibold">
              Balance <span className="text-basic-yellow">{balance}</span> <span className="uppercase">{poolKey}</span>
            </div>
          }
          nodeType="progress"
          nodes={5}
          total={+balance}
          appendLabel={poolKey}
          onValueChange={setStateValue}
        />

        <StepInput
          value={duration}
          title="Duration"
          nodeType="button"
          nodes={[
            { label: 'no lock', value: 0 },
            { label: '1 week', value: 1 },
            { label: '4 weeks', value: 4 },
            { label: '12 weeks', value: 12 },
          ]}
          onValueChange={setDuration}
        />
      </div>

      <StakingRewards stakeValue={stakeValue} duration={duration} />

      <LGButton
        className="uppercase w-[14.375rem] h-[3.1875rem] text-xl font-semibold mt-24"
        label="Stake"
        actived
        disabled={!stakeValue || !duration || !walletProvider}
        onClick={onStake}
      />
    </div>
  );
};

export default observer(StakeTabPanel);
